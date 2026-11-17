---
id: desenvolvimento
title: Desenvolvimento
sidebar_position: 5
---

# Desenvolvimento

## Requisitos

- Node.js 20 ou mais novo e npm.
- PostgreSQL local ou uma conta no [Neon](https://neon.tech/).
- Um projeto Firebase (só para notificações push).

## Servidor

```bash
git clone https://github.com/EttoreCSenatore/varhub-server
cd varhub-server
npm install
cp .env.example .env   # preencha JWT_SECRET e os dados do banco
```

Crie as tabelas e suba o servidor:

```bash
psql "postgresql://USUARIO:SENHA@HOST/BANCO?sslmode=require" -f db/schema.sql
npm start
```

Variáveis de ambiente (`.env.example`):

| Variável | Para quê |
|---|---|
| `PORT` | Porta do servidor (padrão 5000). |
| `ALLOWED_ORIGINS` | Origens do CORS, separadas por vírgula. |
| `JWT_SECRET` | Segredo longo e aleatório para assinar tokens. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexão com o PostgreSQL. |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true` (padrão) verifica o certificado do banco. |
| `FIREBASE_SERVICE_ACCOUNT` | JSON da conta de serviço em uma linha (ou arquivo `serviceAccountKey.json`). |

Sem `FIREBASE_SERVICE_ACCOUNT`, só as notificações falham; o resto funciona. O servidor sobe mesmo sem banco, e `/health` mostra `database: "disconnected"`.

## Cliente

```bash
git clone https://github.com/EttoreCSenatore/varhub-client
cd varhub-client
npm ci --allow-git=all   # o A-Frame traz uma dependência buscada do GitHub
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm run dev
```

Abra `http://localhost:5173`. A câmera e o WebXR exigem **HTTPS** ou `localhost`.

Outros comandos: `npm run build`, `npm run preview`, `npm run lint`.

## Esta documentação

```bash
cd website
npm ci --allow-git=all
npm start            # servidor de desenvolvimento
npm run build        # gera os dois idiomas
npm run typecheck
```

A documentação é bilíngue: o português fica em `website/docs/` e o inglês em `website/i18n/en/docusaurus-plugin-content-docs/current/`. O script `scripts/checar-traducao.py` falha o CI se as duas versões não tiverem a mesma estrutura.
