---
id: intro
title: Visão geral
slug: /intro
sidebar_position: 1
---

# VARHub

**VARHub** é uma plataforma web de marketing criada para o **VARLab** apresentar seus projetos, serviços e inovações por meio de experiências de **realidade aumentada (AR)** e ferramentas de engajamento dos visitantes.

Foi o **projeto final** do programa no **Conestoga College**. O sistema tem duas partes, em dois repositórios:

| Parte | Repositório | O que faz |
|---|---|---|
| **Cliente** | [varhub-client](https://github.com/EttoreCSenatore/varhub-client) | Aplicativo web React (PWA) com galeria, leitor de QR Code e visualizadores AR/VR. |
| **Servidor** | [varhub-server](https://github.com/EttoreCSenatore/varhub-server) | API Express com PostgreSQL: contas, projetos, feedback, analytics e notificações. |

![Página inicial do VARHub](/img/screenshots/app-home.png)

## O que ele faz

| Recurso | Para quê |
|---|---|
| **Galeria de projetos** | Lista os projetos do VARLab e as demonstrações WebXR, só para quem entrou na conta. |
| **Leitor de QR Code** | Lê um QR Code pela câmera e abre o conteúdo associado: vídeo (com visor 360°) ou um link externo. |
| **Visualizadores AR/VR** | Vídeo 360° (A-Frame), modelos 3D (Three.js) e demonstrações WebXR no navegador. |
| **Contas** | Cadastro e login com senha (bcrypt) e token JWT de 24 horas. |
| **Feedback** | Avaliação de 1 a 5 com comentário, ligada a um projeto e a quem a enviou. |
| **PWA e offline** | Instalável, com service worker (Workbox) e cache de imagens e modelos. |
| **Notificações push** | Firebase Cloud Messaging, enviadas pelo servidor. |
| **Analytics** | Registro de visualizações e feedbacks (`engagement_logs`), consultável só por quem está autenticado. |

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite, React Router, Bootstrap, Three.js, React Three Fiber, A-Frame, WebXR |
| QR Code | `html5-qrcode` e `jsQR` |
| Backend | Node.js, Express 4, `pg`, `jose`, `bcryptjs`, Helmet, `express-rate-limit` |
| Banco | PostgreSQL (Neon Serverless) |
| Notificações | Firebase Cloud Messaging e Firebase Admin |
| Hospedagem | Vercel (cliente) e Railway (servidor); vídeos 360° em AWS S3 |

## Onde continuar

- [Arquitetura](tecnico/arquitetura): como as peças se conectam.
- [AR e QR Code](tecnico/ar-e-qr): como o conteúdo imersivo é aberto.
- [API](tecnico/api): rotas, autenticação e erros.
- [Segurança](tecnico/seguranca): o que está protegido e o que ainda falta.
- [Desenvolvimento](tecnico/desenvolvimento): como rodar tudo localmente.
- [Roadmap](roadmap): o que foi entregue e o que ficou planejado.
