# VARHub (client)

**English** · [Português](README.md)

**VARLab**'s web marketing platform: visitors scan a QR code and explore projects in **AR (3D models)** and **360° video** on their phone, and leave feedback with no account. Staff get a dashboard with metrics and printable QR codes. It was my **capstone project at Conestoga College**.

📖 Documentation: https://ettorecsenatore.github.io/varhub-client/ (Portuguese and English)

This repository is the **client** (React 19 + Vite). The API lives in [varhub-server](https://github.com/EttoreCSenatore/varhub-server).

<img src="website/static/img/screenshots/app-home.png" alt="VARHub home page on a phone" width="280">

## Running locally

```bash
npm ci
npm run dev              # Vite forwards /api to http://localhost:5000
npm run dev:phone        # HTTPS on the local network, to test camera and AR on a phone
```

See [Development](https://ettorecsenatore.github.io/varhub-client/en/docs/tecnico/desenvolvimento) to start the server and database. Vulnerabilities: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE.txt). The samples in `public/webxr-samples-main` are MIT, © The Immersive Web Community Group.
