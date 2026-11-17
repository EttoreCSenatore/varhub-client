---
id: intro
title: Visão geral
slug: /intro
sidebar_position: 1
---

# VARHub

**VARHub** é um conceito de plataforma para **publicar projetos de VR e AR** para **empresas e escolas**: o público escaneia um QR Code e explora **modelos 3D com realidade aumentada** e **vídeo 360°** direto no navegador do celular, sem instalar nada. É **software livre** (AGPL-3.0-or-later) e foi pensado para ser **adaptado por qualquer negócio ou instituição de ensino**: troque nome, logotipo e cores, cadastre seus projetos e imprima seus QR Codes. Veja [Adaptar ao seu negócio](adaptar).

Nasceu como o meu **projeto final** no **Conestoga College**, tendo o **VARLab** como caso de uso original. O sistema tem duas partes, em dois repositórios:

| Parte | Repositório | O que faz |
|---|---|---|
| **Cliente** | [varhub-client](https://github.com/EttoreCSenatore/varhub-client) | Aplicativo web React (PWA), pensado primeiro para o celular. |
| **Servidor** | [varhub-server](https://github.com/EttoreCSenatore/varhub-server) | API Express com PostgreSQL: projetos, feedback, eventos de uso, contas e painel. |

![Página inicial do VARHub no celular](/img/screenshots/app-home.png)

## Como o visitante usa

1. **Escaneia** um QR Code da organização (pelo leitor do app ou pela câmera do celular) e cai direto na página do projeto.
2. **Explora**: gira um modelo 3D e o coloca no ambiente com AR, ou olha ao redor em um vídeo 360°.
3. **Avalia**: dá de 1 a 5 estrelas e deixa um comentário, sem precisar de conta.

## O que a equipe da organização faz

Entra com uma conta de administrador e, no **painel**, vê escaneamentos, lançamentos de AR e avaliações dos últimos 14 dias, cadastra e publica projetos e **baixa o QR Code** de cada um para imprimir.

![Lista de projetos no celular](/img/screenshots/app-projects.png)

## Recursos

| Recurso | Para quê |
|---|---|
| **Galeria pública** | Busca e filtro por tipo (3D/AR, vídeo 360°, demo WebXR, link). Sem login. |
| **Leitor de QR Code** | Câmera ao vivo ou foto do QR; abre o projeto dentro do app. |
| **AR para modelos 3D** | `<model-viewer>`: AR no Android (WebXR ou Scene Viewer) e no iPhone (Quick Look). |
| **Vídeo 360°** | Arraste para olhar ao redor, ou use o movimento do celular. |
| **Feedback** | Nota e comentário, anônimos ou ligados à conta; resumo público sem dados do autor. |
| **PWA e offline** | Instalável; a lista de projetos e as mídias ficam em cache. |
| **Painel administrativo** | Métricas, gestão de projetos e QR Codes para imprimir. |

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite, React Router, Bootstrap, `@google/model-viewer`, Three.js, `jsQR`, `qrcode` |
| Backend | Node.js, Express, `pg`, `jose` (JWT), `bcryptjs`, Helmet, `express-rate-limit` |
| Banco | PostgreSQL (Neon Serverless) |
| Testes | Vitest e Testing Library (cliente); `node:test` com PostgreSQL real (servidor) |
| Hospedagem (original) | Vercel (cliente) e Railway (servidor); documentação no GitHub Pages. Qualquer host Node e estático serve. |

## Onde continuar

- [Arquitetura](tecnico/arquitetura): como as peças se conectam.
- [AR e QR Code](tecnico/ar-e-qr): como o conteúdo imersivo abre no celular.
- [API](tecnico/api): rotas, autenticação e erros.
- [Segurança](tecnico/seguranca): o que está protegido e o que ainda falta.
- [Desenvolvimento](tecnico/desenvolvimento): como rodar tudo e testar no celular.
- [Adaptar ao seu negócio](adaptar): marca, hospedagem e casos de uso.
- [Roadmap](roadmap): o que foi entregue e o que ficou planejado.
