# Contributing / Como contribuir

Thanks for helping! The project follows a public [roadmap](https://ettorecsenatore.github.io/varhub-client/en/docs/roadmap) (R1 to R7) and a
[decision log](https://ettorecsenatore.github.io/varhub-client/en/docs/projeto/decisoes). By contributing you agree that your contribution is licensed under
the AGPL-3.0-or-later (code, see [LICENSE](LICENSE)) or CC BY-SA 4.0 (documentation, see [LICENSE-DOCS.md](LICENSE-DOCS.md)).

## Development

You need the API running locally; see [Development](https://ettorecsenatore.github.io/varhub-client/en/docs/tecnico/desenvolvimento) (PostgreSQL in Docker, `npm run db:seed`, `npm run dev` in `varhub-server`). Then:

```bash
npm ci
npm run dev              # http://localhost:5173, Vite forwards /api to the server
npm run dev:phone        # HTTPS on your network, to test the camera and AR on a phone
npm test && npm run lint
```

## Conventions

- **Phone first:** check UI changes at a phone viewport; keep touch targets at least 44 px and the first screen light (the initial JavaScript budget is about 350 KB).
- **Tests:** a behavior change comes with a test.
- **Docs in two languages:** change the Portuguese page in `website/docs/` and the English one in `website/i18n/en/...` together; `scripts/checar-traducao.py` fails CI when they diverge. UI screenshots are welcome.
- **Releases:** a user-visible change gets an entry in `releases.yaml` (English and pt-BR), and the version in `package.json` goes up (SemVer). CI creates the tag and the GitHub Release; the entry also shows on the What's new page.
- **Dependencies:** justify new ones; the license audit (AGPL-compatible) runs in CI.
- **Decisions:** an important choice gets a row in the decision log (`website/docs/projeto/decisoes.md`, both languages).

## Pull requests

1. Fork, branch, make the change with tests.
2. Open a pull request explaining what and why. CI must be green.
3. Squash-merge once reviewed.

## Em português

Abra uma issue ou um PR explicando o quê e por quê. Mudou comportamento? Inclua testes, atualize a documentação nos dois idiomas, adicione uma entrada em `releases.yaml` e suba a versão. Para a API, veja o repositório `varhub-server`.
