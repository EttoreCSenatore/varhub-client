---
id: versoes
title: Versões e releases
sidebar_position: 2
---

# Versões e releases

## Número da versão: `MAIOR.MENOR.CORREÇÃO`

Seguimos o [Versionamento Semântico](https://semver.org/lang/pt-BR/):

| Parte | Quando sobe | Exemplo |
|---|---|---|
| **MAIOR** | Mudança grande que quebra a compatibilidade (por exemplo, o cliente antigo deixa de funcionar com a API nova) | 2.1.0 → **3.0.0** |
| **MENOR** | **Funcionalidade nova** ou melhoria relevante compatível | 2.1.0 → **2.2.0** |
| **CORREÇÃO** | Correção de erro ou ajuste pequeno | 2.1.0 → **2.1.1** |

O cliente e o servidor têm numeração própria, cada um no seu `package.json`. O rodapé do site mostra as duas.

## Onde ficam as notas: `releases.yaml`

O `releases.yaml` de cada repositório é a **fonte única** do histórico. Ele alimenta:

- a página **O que há de novo** do app (`/whats-new`);
- o **GitHub Release**, em inglês;
- a conferência do CI: o primeiro item precisa ser igual à versão do `package.json`.

```yaml
- version: 2.2.0
  date: 2026-12-01
  title:
    en: Per-location QR codes
    pt-br: QR Codes por local
  items:
    - kind: new            # new | improvement | fix | security
      text:
        en: Each QR code can carry a location, shown on the dashboard.
        pt-br: Cada QR Code pode levar um local, mostrado no painel.
```

## Como publicar uma versão

1. Escreva a entrada no topo do `releases.yaml` (inglês e português) e suba a versão no `package.json` e no `package-lock.json`.
2. Abra o PR; o CI confere o formato e a correspondência das versões.
3. Ao mesclar na `main`, o CI publica a imagem Docker e cria a **tag `vX.Y.Z`** e o **GitHub Release**, se ainda não existirem. Ninguém precisa lembrar.

A tag da versão aponta para a primeira imagem daquela versão e nunca é movida.
