---
id: licenca
title: Licença
sidebar_position: 2
---

# Licença

O VARHub é **software livre e de código aberto**, com copyleft de rede.

| Parte | Licença |
|---|---|
| Código do cliente e do servidor | [GNU AGPL-3.0-or-later](https://www.gnu.org/licenses/agpl-3.0.html) (arquivo `LICENSE` de cada repositório) |
| Documentação e imagens de demonstração | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br) (arquivo `LICENSE-DOCS.md`) |

## O que isso permite

A AGPL é aprovada pela **Open Source Initiative** e é uma licença de software livre da **Free Software Foundation**. Você pode **usar, estudar, modificar e distribuir** o VARHub, inclusive em produtos comerciais e para qualquer empresa ou escola.

## O que ela exige

- Ao **distribuir** o VARHub ou uma versão modificada, mantenha a licença e o aviso de copyright e entregue o código-fonte sob a mesma licença.
- Como o VARHub é um **serviço de rede**, a AGPL vai além: se você **hospedar uma versão modificada** para outras pessoas usarem, precisa **oferecer o código-fonte dessa versão** aos usuários (seção 13). Na prática, mantenha o link **Source** do rodapé apontando para o seu repositório.
- Usar o VARHub **sem modificá-lo** não exige publicar nada além da própria licença.

Esta página é um resumo, não aconselhamento jurídico; vale o texto da licença.

## Marcas e materiais de terceiros

- **VARLab** e **Conestoga College**, seus nomes e logotipos, pertencem aos seus titulares e **não** são cobertos pela licença. Ao adaptar o projeto, use o seu próprio nome e logotipo (veja [Adaptar ao seu negócio](adaptar)).
- Os dados de demonstração (`db/seed.sql`) apontam para arquivos públicos de terceiros, como o modelo do astronauta do projeto `<model-viewer>` e os exemplos oficiais do WebXR. Eles seguem as licenças dos seus autores e não fazem parte do VARHub.
- As bibliotecas usadas (React, Three.js, `<model-viewer>`, Express e outras) têm licenças de código aberto compatíveis com a AGPL, verificadas por `scripts/auditar-licencas.py` no CI.
