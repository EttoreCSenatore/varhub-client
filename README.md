# VARHub (cliente)

[English](README.en.md) · **Português**

Plataforma web de marketing do **VARLab**: galeria de projetos, AR por QR Code (WebXR, Three.js, A-Frame), feedback, PWA e notificações push. Foi o meu **projeto final no Conestoga College**.

📖 Documentação: https://ettorecsenatore.github.io/varhub-client/ (português e inglês)

Este repositório é o **cliente** (React 19 + Vite). A API está em [varhub-server](https://github.com/EttoreCSenatore/varhub-server).

![Página inicial do VARHub](website/static/img/screenshots/app-home.png)

## Rodando localmente

```bash
npm ci --allow-git=all   # o A-Frame traz uma dependência buscada do GitHub
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm run dev
```

Veja [Desenvolvimento](https://ettorecsenatore.github.io/varhub-client/docs/tecnico/desenvolvimento) para subir o servidor e o banco. Vulnerabilidades: [SECURITY.md](SECURITY.md).

## Licença

[MIT](LICENSE.txt). Os exemplos em `public/webxr-samples-main` são MIT, © The Immersive Web Community Group.
