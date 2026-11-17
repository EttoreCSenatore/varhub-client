# VARHub (client)

**English** · [Português](README.md)

**A free concept for publishing VR and AR projects for companies and schools.** The audience scans a QR code and explores **3D models with AR** and **360° video** on their phone, and leaves feedback with no account. Staff get a dashboard with metrics and printable QR codes. It can be **adapted by any business or institution** (name, logo, colours and content are configurable). It started as my **capstone project at Conestoga College**, with VARLab as the original use case.

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

[MIT](LICENSE.txt): free software, you may use, modify and distribute it, including commercially. The names and logos of VARLab and Conestoga College are not licensed. See [Adapt it to your business](https://ettorecsenatore.github.io/varhub-client/en/docs/adaptar).
