# VARHub (cliente)

[English](README.en.md) · **Português**

Plataforma web de marketing do **VARLab**: o visitante escaneia um QR Code e explora projetos em **AR (modelos 3D)** e **vídeo 360°** no celular, e deixa feedback sem precisar de conta. A equipe tem um painel com métricas e QR Codes para imprimir. Foi o meu **projeto final no Conestoga College**.

📖 Documentação: https://ettorecsenatore.github.io/varhub-client/ (português e inglês)

Este repositório é o **cliente** (React 19 + Vite). A API está em [varhub-server](https://github.com/EttoreCSenatore/varhub-server).

<img src="website/static/img/screenshots/app-home.png" alt="Página inicial do VARHub no celular" width="280">

## Rodando localmente

```bash
npm ci
npm run dev              # o Vite repassa /api para http://localhost:5000
npm run dev:phone        # HTTPS na rede local, para testar câmera e AR no celular
```

Veja [Desenvolvimento](https://ettorecsenatore.github.io/varhub-client/docs/tecnico/desenvolvimento) para subir o servidor e o banco. Vulnerabilidades: [SECURITY.md](SECURITY.md).

## Licença

[MIT](LICENSE.txt). Os exemplos em `public/webxr-samples-main` são MIT, © The Immersive Web Community Group.
