---
id: adaptar
title: Adaptar ao seu negócio
sidebar_position: 3
---

# Adaptar ao seu negócio

O VARHub é um **modelo reutilizável** para qualquer organização que queira mostrar experiências de VR e AR sem pedir que o público instale um aplicativo. O VARLab foi o caso de uso original; nada no código é exclusivo dele.

## Quem pode usar

| Tipo | Exemplo de uso |
|---|---|
| **Escolas e universidades** | Modelos 3D de anatomia, máquinas ou obras de arte; passeio 360° pelo campus; feiras de projetos com um QR Code por trabalho de aluno. |
| **Empresas e indústria** | Catálogo de produtos em AR na mesa do cliente; treinamento com vídeo 360° de uma planta; demonstrações em estandes de feiras. |
| **Museus, imobiliárias e turismo** | Peças e imóveis em 3D, visitas 360° e roteiros com QR Codes nos locais. |
| **Laboratórios e estúdios de XR** | Portfólio vivo de demos WebXR, com feedback e métricas por projeto. |

## O que você troca

| O quê | Como |
|---|---|
| Nome, organização e frase de apresentação | Variáveis `VITE_BRAND_NAME`, `VITE_ORG_NAME` e `VITE_TAGLINE` no `.env` do cliente. Também alimentam o título da página e o manifesto do PWA. |
| Logotipo e ícones | Substitua `public/logo192.png` e `public/logo512.png` (e `public/icons/apple-touch-icon.png`). |
| Cores | Variáveis no topo de `src/styles.css` (`--vh-primary`, `--vh-accent`). |
| Conteúdo | Pelo **painel**: título, descrição, tipo (3D/AR, vídeo 360°, demo WebXR ou link), miniatura e URL da mídia. Nada é fixo no código. |
| QR Codes | Botão **QR** de cada projeto no painel, pronto para imprimir. |
| Idioma | O app é em inglês; os textos ficam nos componentes e podem ser traduzidos. |

## O que você precisa hospedar

1. **Banco PostgreSQL** (Neon, Supabase, RDS ou próprio).
2. **API** (`varhub-server`) em qualquer host Node: Railway, Render, Fly.io ou uma VM.
3. **Cliente** (`varhub-client`) como site estático: Vercel, Netlify, GitHub Pages com rota de fallback, ou o mesmo servidor.
4. **Arquivos de mídia** (`.glb`, `.usdz`, `.mp4`) em um armazenamento com **CORS** habilitado: S3, Cloudflare R2 ou similar.

Defina `VITE_API_URL` no cliente e `ALLOWED_ORIGINS` na API. O passo a passo local está em [Desenvolvimento](tecnico/desenvolvimento).

## Preparando as mídias

- **Modelos 3D**: `.glb` leve (idealmente abaixo de 10 MB). Para um AR melhor no iPhone, adicione também um `.usdz`.
- **Vídeo 360°**: MP4 equirretangular (proporção 2:1), H.264, de preferência até 4K e com bitrate moderado para carregar no celular.
- **Demos WebXR**: qualquer página WebXR pública; o app só abre o endereço.

## Antes de publicar

- Se você **hospedar uma versão modificada**, a AGPL exige oferecer o código-fonte aos usuários: aponte o link **Source** do rodapé para o seu repositório (veja [Licença](licenca)).
- Troque o logotipo e os textos. Nomes e logotipos do VARLab e do Conestoga College **não** estão licenciados para uso por terceiros (ver [Licença](licenca)).
- Gere um `JWT_SECRET` forte e promova só as contas de administrador necessárias.
- Revise a [Segurança](tecnico/seguranca): cadastro sem verificação de e-mail e comentários sem moderação podem exigir ajustes no seu contexto.
- Se coletar dados de pessoas, avalie as leis de privacidade do seu país (por exemplo LGPD, GDPR ou PIPEDA). O feedback anônimo não guarda nome nem IP, mas contas guardam e-mail.
