---
id: roadmap
title: Roadmap
sidebar_position: 3
---

# Roadmap

O projeto foi entregue como trabalho final. Esta página separa o que **funciona hoje** do que ficou **planejado**.

## Entregue

- Galeria de projetos protegida por login.
- Cadastro e login com JWT.
- Leitor de QR Code (câmera) que abre vídeos no reprodutor, com visor 360°, e links externos.
- Demonstrações WebXR na galeria (AR, VR, hit-test, âncoras, mãos, fotos e vídeos 360°) e componente de visualização de modelos 3D com hit-test.
- Formulário de feedback com avaliação de 1 a 5.
- PWA com cache offline e notificações push (FCM).
- API com projetos, feedback, analytics e notificações, e esquema SQL versionado.
- Endurecimento de segurança do servidor (ver [Segurança](tecnico/seguranca)).

## Planejado

- Mapa 2D do campus com integração ao **ARWay** (prova de conceito).
- Painel de analytics com gráficos de engajamento e tendência de feedback.
- Downloads para uso offline (folhetos, vídeos e marcadores AR).
- Cadastro de projetos e de conteúdo AR por uma área administrativa (hoje os dados entram direto no banco).
- Papéis de usuário (administrador e visitante) para restringir analytics e notificações.
- Testes automatizados no cliente e no servidor.
- Troca dos proxies CORS públicos por uma configuração de CORS no bucket S3.

## Problemas conhecidos

- O visualizador de modelos 3D (`ARViewer`) existe, mas não está ligado a nenhuma rota: a página de projetos navega para `/ar-viewer`, que não está registrada em `App.jsx`.
- O botão "Login with Google" é só um espaço reservado: o login com Google ainda não foi implementado.
- O cliente usa o login do próprio servidor (JWT), não o Firebase Authentication descrito no README original.
- As dependências do A-Frame incluem um pacote buscado direto do GitHub (`three-bmfont-text`), o que exige permitir dependências git no `npm ci`.
