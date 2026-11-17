---
id: roadmap
title: Roadmap
sidebar_position: 4
---

# Roadmap

Esta página separa o que **funciona hoje** do que ficou **planejado**.

## Entregue

- Galeria pública de projetos, com busca e filtro por tipo.
- Página de projeto com visualizador 3D e AR (`<model-viewer>`), vídeo 360° e demonstrações WebXR.
- Leitor de QR Code (câmera ou foto) que abre o projeto dentro do app, e links `?src=qr` contados como escaneamento.
- Feedback anônimo ou com conta, com resumo público sem dados do autor.
- Contas com JWT e papéis (visitante e administrador).
- Painel administrativo: métricas, cadastro, edição e publicação de projetos, e download do QR Code de cada projeto.
- PWA com cache offline da lista de projetos e das mídias.
- API com migrações, testes de integração com PostgreSQL e CI.
- Endurecimento de segurança (ver [Segurança](tecnico/seguranca)).

## Planejado

- Notificações push: o servidor já envia (rota de administrador), mas falta o cliente registrar o dispositivo e guardar o token.
- Mapa 2D do campus com integração ao **ARWay** (prova de conceito).
- Upload de modelos e vídeos pelo painel (hoje o painel recebe a URL do arquivo).
- Moderação de comentários.
- Login com Google.
- Trocar o token no `localStorage` por cookie `HttpOnly`.
- Testes de ponta a ponta (Playwright) em celular real ou emulado.

## Pontos de atenção

- Vídeos 360° precisam de uma hospedagem com cabeçalhos CORS (por exemplo, um bucket S3 configurado). Sem isso o navegador bloqueia a textura.
- A câmera e o WebXR exigem **HTTPS**. Em desenvolvimento use `npm run dev:phone`.
- O backend publicado anteriormente na Railway não existe mais; é preciso reimplantar a API e apontar `VITE_API_URL` para ela.
