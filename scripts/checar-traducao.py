#!/usr/bin/env python3
"""Confere que cada página da documentação em português tem a versão em inglês, com a mesma estrutura.

A documentação é bilíngue (pt-BR em `website/docs/`, inglês em `website/i18n/en/docusaurus-plugin-content-docs/current/`).
Falha se faltar uma página em inglês ou se o número de títulos, blocos de código ou imagens divergir (sinal de que uma
das versões ficou para trás). Só biblioteca padrão.
"""

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent / "website"
PT = RAIZ / "docs"
EN = RAIZ / "i18n" / "en" / "docusaurus-plugin-content-docs" / "current"


def estrutura(texto: str) -> tuple[int, int, int]:
    sem_front = re.sub(r"\A---\n.*?\n---\n", "", texto, flags=re.S)
    blocos = sem_front.count("```") // 2
    sem_codigo = re.sub(r"```.*?```", "", sem_front, flags=re.S)
    titulos = len(re.findall(r"^#{1,4} ", sem_codigo, flags=re.M))
    imagens = len(re.findall(r"!\[[^\]]*\]\(|<img ", sem_codigo))
    return titulos, blocos, imagens


def main() -> int:
    problemas = []
    for pt in sorted(PT.rglob("*.md")):
        rel = pt.relative_to(PT)
        en = EN / rel
        if not en.exists():
            problemas.append(f"falta a versão em inglês de {rel}")
            continue
        a, b = estrutura(pt.read_text(encoding="utf-8")), estrutura(en.read_text(encoding="utf-8"))
        if a != b:
            problemas.append(f"{rel}: estrutura diferente (títulos, blocos de código, imagens) pt={a} en={b}")
    for en in sorted(EN.rglob("*.md")):
        if not (PT / en.relative_to(EN)).exists():
            problemas.append(f"página em inglês sem original em português: {en.relative_to(EN)}")
    if problemas:
        print("\n".join(problemas), file=sys.stderr)
        return 1
    print(f"ok: {len(list(PT.rglob('*.md')))} páginas com versão em inglês e mesma estrutura")
    return 0


if __name__ == "__main__":
    sys.exit(main())
