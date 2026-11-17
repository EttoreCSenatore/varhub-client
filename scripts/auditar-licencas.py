#!/usr/bin/env python3
"""Audita as licenças das dependências de runtime (Python e npm) e gera o THIRD_PARTY_NOTICES.md.

O VARHub é AGPL-3.0-or-later. Dependências permissivas (MIT, BSD, Apache-2.0, ISC...) e LGPL/MPL são compatíveis.
Tudo o que for desconhecido, proprietário ou incompatível (ex.: GPL-2.0-only, SSPL, CC-BY-NC) reprova.

Uso (a partir da raiz do repositório):
    python scripts/auditar-licencas.py --python            # lê as dependências de api/pyproject.toml (venv ativo)
    python scripts/auditar-licencas.py --npm web           # lê web/package.json e web/node_modules
    python scripts/auditar-licencas.py --npm website
    python scripts/auditar-licencas.py --notices           # tudo junto, grava THIRD_PARTY_NOTICES.md
"""

import argparse
import hashlib
import json
import re
import sys
import tomllib
from importlib import metadata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
COMPATIVEIS = {
    "mit", "mit-0", "bsd", "bsd-2-clause", "bsd-3-clause", "0bsd", "isc", "apache-2.0", "unlicense", "cc0-1.0", "psf-2.0",
    "python-2.0", "mpl-2.0", "lgpl-2.1", "lgpl-2.1-only", "lgpl-2.1-or-later", "lgpl-3.0", "lgpl-3.0-only",
    "lgpl-3.0-or-later", "blueoak-1.0.0", "zlib", "cc-by-4.0", "cc-by-3.0", "wtfpl", "agpl-3.0", "agpl-3.0-only",
    "agpl-3.0-or-later", "gpl-3.0", "gpl-3.0-only", "gpl-3.0-or-later", "gpl-2.0-or-later", "python-2.0.1", "bsd-3-clause-clear",
}  # fmt: skip
CLASSIFICADORES = {
    "mit license": "MIT", "bsd license": "BSD", "apache software license": "Apache-2.0", "isc license (iscl)": "ISC",
    "mozilla public license 2.0 (mpl 2.0)": "MPL-2.0", "python software foundation license": "PSF-2.0",
    "the unlicense (unlicense)": "Unlicense", "gnu lesser general public license v3 (lgplv3)": "LGPL-3.0-only",
    "gnu lesser general public license v2 or later (lgplv2+)": "LGPL-2.1-or-later",
    "gnu affero general public license v3": "AGPL-3.0-only",
}  # fmt: skip
# Pacotes sem o campo "license" no package.json, mas com o texto MIT no próprio arquivo de licença (conferido à mão).
CONFERIDOS_A_MAO = {"khroma": "MIT", "require-like": "MIT"}
ARQ_LICENCA = re.compile(r"^(licen[sc]e|copying|notice|unlicense)", re.I)


def compativel(expr: str) -> bool:
    """Avalia expressões SPDX simples: 'A OR B', 'A AND B', parênteses. OR basta um; AND exige todos."""
    tokens = re.findall(r"\(|\)|[^\s()]+", expr.replace("(", " ( ").replace(")", " ) "))
    pos = 0

    def ou() -> bool:
        nonlocal pos
        r = e()
        while pos < len(tokens) and tokens[pos].upper() == "OR":
            pos += 1
            r = e() or r
        return r

    def e() -> bool:
        nonlocal pos
        r = atomo()
        while pos < len(tokens) and tokens[pos].upper() == "AND":
            pos += 1
            r = atomo() and r
        return r

    def atomo() -> bool:
        nonlocal pos
        t = tokens[pos]
        pos += 1
        if t == "(":
            r = ou()
            pos += 1
            return r
        return t.lower().removesuffix("+") in COMPATIVEIS or t.lower() in COMPATIVEIS

    try:
        return ou()
    except IndexError:
        return False


def _normaliza(lic: str) -> str:
    lic = lic.strip()
    return CLASSIFICADORES.get(lic.lower(), lic)


# --- Python -------------------------------------------------------------------------------------------------


def _nome(req: str) -> str:
    return re.split(r"[\s;\[<>=!~(]", req, maxsplit=1)[0].lower().replace("_", "-")


def python_runtime(pyproject: str = "api/pyproject.toml") -> dict[str, metadata.Distribution]:
    deps = tomllib.loads((RAIZ / pyproject).read_text())["project"]["dependencies"]
    achados: dict[str, metadata.Distribution] = {}
    pilha = [_nome(d) for d in deps]
    while pilha:
        n = pilha.pop()
        if n in achados:
            continue
        try:
            d = metadata.distribution(n)
        except metadata.PackageNotFoundError:
            continue  # dependência opcional ou de outra plataforma que não está instalada
        achados[n] = d
        for r in d.requires or []:
            if "extra ==" in r.replace('"', "'").replace("'", ""):
                continue
            pilha.append(_nome(r))
    return achados


def licenca_python(d: metadata.Distribution) -> str:
    md = d.metadata
    expr = md.get("License-Expression")
    if expr:
        return expr
    lic = (md.get("License") or "").strip()
    if lic and len(lic) < 80 and "\n" not in lic:
        return _normaliza(lic)
    cls = [c.split("::")[-1].strip() for c in md.get_all("Classifier") or [] if c.startswith("License ::")]
    cls = [_normaliza(c) for c in cls if c.lower() != "osi approved"]
    return " OR ".join(cls) if cls else "DESCONHECIDA"


def textos_python(d: metadata.Distribution) -> list[tuple[str, str]]:
    out = []
    for f in d.files or []:
        if ARQ_LICENCA.match(Path(f).name):
            try:
                t = d.read_text(str(f))
            except (OSError, UnicodeDecodeError):
                t = None
            if t:
                out.append((Path(f).name, t))
    return out


# --- npm ----------------------------------------------------------------------------------------------------


def npm_runtime(pasta: str) -> dict[str, tuple[Path, dict]]:
    base = RAIZ / pasta
    raiz = json.loads((base / "package.json").read_text())
    achados: dict[str, tuple[Path, dict]] = {}
    pilha: list[tuple[Path, str]] = [(base, n) for n in raiz.get("dependencies", {})]
    while pilha:
        de, nome = pilha.pop()
        atual = de
        pkg_dir = None
        while True:  # resolução do Node: node_modules mais próximo, subindo as pastas
            c = atual / "node_modules" / nome
            if (c / "package.json").is_file():
                pkg_dir = c
                break
            if atual == base.parent or atual == atual.parent:
                break
            atual = atual.parent
        if not pkg_dir:
            continue
        pj = json.loads((pkg_dir / "package.json").read_text())
        chave = f"{pj.get('name', nome)}@{pj.get('version', '?')}"
        if chave in achados:
            continue
        achados[chave] = (pkg_dir, pj)
        for dep in {**pj.get("dependencies", {}), **pj.get("optionalDependencies", {})}:
            pilha.append((pkg_dir, dep))
    return achados


def licenca_npm(pj: dict) -> str:
    lic = pj.get("license") or pj.get("licenses")
    if isinstance(lic, dict):
        lic = lic.get("type")
    if isinstance(lic, list):
        lic = " OR ".join(x.get("type", "?") if isinstance(x, dict) else str(x) for x in lic)
    return str(lic) if lic else "DESCONHECIDA"


def textos_npm(pkg_dir: Path) -> list[tuple[str, str]]:
    return [
        (f.name, f.read_text(errors="replace")) for f in sorted(pkg_dir.iterdir()) if f.is_file() and ARQ_LICENCA.match(f.name)
    ]


# --- Relatório ----------------------------------------------------------------------------------------------


def coleta(alvo: str, pyproject: str = "api/pyproject.toml") -> list[dict]:
    itens = []
    if alvo == "python":
        for n, d in sorted(python_runtime(pyproject).items()):
            itens.append({"eco": "python", "nome": n, "versao": d.version, "licenca": licenca_python(d), "textos": textos_python(d)})
    else:
        for chave, (dir_, pj) in sorted(npm_runtime(alvo).items()):
            nome, _, ver = chave.rpartition("@")
            lic = licenca_npm(pj)
            if lic == "DESCONHECIDA":
                lic = CONFERIDOS_A_MAO.get(nome, lic)
            itens.append({"eco": alvo, "nome": nome, "versao": ver, "licenca": lic, "textos": textos_npm(dir_)})
    return itens


def confere(itens: list[dict]) -> list[dict]:
    return [i for i in itens if not compativel(i["licenca"])]


def notices(todos: list[dict]) -> str:
    linhas = [
        "# Avisos de terceiros",
        "",
        "A Caderneta é distribuída sob a **GNU AGPL-3.0-or-later** (arquivo `LICENSE`). Ela usa os componentes abaixo, cada um sob a",
        "sua própria licença, compatível com a AGPL. Cobre o que vai no produto (API em Python e app web). O site de documentação",
        "é construído com Docusaurus e suas licenças são verificadas no CI. Este arquivo é **gerado** por",
        "`python scripts/auditar-licencas.py --notices`: não edite à mão.",
        "",
        "| Componente | Versão | Licença | Origem |",
        "|---|---|---|---|",
    ]
    for i in sorted(todos, key=lambda x: (x["eco"], x["nome"].lower())):
        linhas.append(f"| {i['nome']} | {i['versao']} | {i['licenca']} | {i['eco']} |")
    linhas += ["", "## Textos das licenças", ""]
    grupos: dict[str, tuple[str, list[str]]] = {}
    for i in todos:
        for _, t in i["textos"][:2]:
            h = hashlib.sha256(t.strip().encode()).hexdigest()
            grupos.setdefault(h, (t.strip(), []))[1].append(f"{i['nome']} {i['versao']}")
    for texto, quem in sorted(grupos.values(), key=lambda g: g[1][0].lower()):
        resumo = ", ".join(sorted(set(quem))[:8]) + (" e outros" if len(set(quem)) > 8 else "")
        linhas += [f"### {resumo}", "", "```text", texto.replace("```", "'''"), "```", ""]
    return "\n".join(linhas) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--python", action="store_true")
    ap.add_argument("--pyproject", default="api/pyproject.toml", help="com --python: pyproject a auditar (ex.: cli/pyproject.toml)")
    g.add_argument("--npm", metavar="PASTA")
    g.add_argument("--notices", action="store_true")
    a = ap.parse_args()
    if a.notices:
        todos = coleta("python") + coleta("web")  # o app; o site de documentação é só verificado (--npm website)
    else:
        todos = coleta("python" if a.python else a.npm, a.pyproject)
    ruins = confere(todos)
    print(f"{len(todos)} componentes de runtime verificados; {len(ruins)} com problema.")
    for i in ruins:
        print(f"  ✗ {i['eco']}: {i['nome']} {i['versao']}: licença '{i['licenca']}'")
    if a.notices:
        (RAIZ / "THIRD_PARTY_NOTICES.md").write_text(notices(todos))
        print("THIRD_PARTY_NOTICES.md gravado.")
    return 1 if ruins else 0


if __name__ == "__main__":
    sys.exit(main())
