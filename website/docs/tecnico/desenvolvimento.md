---
id: desenvolvimento
title: Desenvolvimento
sidebar_position: 5
---

# Desenvolvimento

## Requisitos

- Node.js 20 ou mais novo e npm.
- PostgreSQL 15+ (o jeito mais fácil é Docker) ou uma conta no [Neon](https://neon.tech/).

## 1. Banco e servidor

```bash
docker run -d --name varhub-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=varhub \
  -p 127.0.0.1:5433:5432 postgres:17-alpine

git clone https://github.com/EttoreCSenatore/varhub-server
cd varhub-server
npm install
cp .env.example .env     # preencha JWT_SECRET, DB_PORT=5433, DB_PASSWORD=dev, DB_SSL=false
npm run db:seed          # cria as tabelas e projetos de demonstração
npm run dev
```

Variáveis de ambiente (`.env.example`):

| Variável | Para quê |
|---|---|
| `PORT` | Porta do servidor (padrão 5000). |
| `ALLOWED_ORIGINS` | Origens do CORS, separadas por vírgula. |
| `JWT_SECRET` | Segredo longo e aleatório (`openssl rand -hex 32`). |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexão com o PostgreSQL. |
| `DB_SSL` | `false` para banco local; por padrão o TLS é usado fora do localhost. |
| `FIREBASE_SERVICE_ACCOUNT` | Só para a rota de push do administrador. |

### Criar um administrador

Cadastre-se pelo app e depois promova a conta:

```bash
npm run admin:promote -- voce@exemplo.com
```

### Testes

```bash
docker exec varhub-pg psql -U postgres -c "CREATE DATABASE varhub_test"
npm test                 # testes de integração contra o PostgreSQL
```

## 2. Cliente

```bash
git clone https://github.com/EttoreCSenatore/varhub-client
cd varhub-client
npm ci
npm run dev              # http://localhost:5173 (o Vite repassa /api para o servidor)
```

Outros comandos: `npm test`, `npm run lint`, `npm run build`.

## 3. Testar no celular

A câmera (QR Code) e o AR só funcionam em páginas **HTTPS**. Com o celular na **mesma rede Wi-Fi**:

```bash
npm run dev:phone        # HTTPS na rede local, certificado de desenvolvimento
```

Abra o endereço `https://<IP-do-computador>:5173` no celular e aceite o aviso do certificado de desenvolvimento. A API passa pelo mesmo endereço, então nada mais precisa mudar. Verifique:

1. **Scan**: aponte para o QR Code baixado no painel e veja o projeto abrir.
2. **3D/AR**: abra o projeto do astronauta e toque em **View in your space**.
3. **360°**: toque em Play, arraste e teste **Use phone motion**.
4. **Instalar**: menu do navegador, "Adicionar à tela inicial", e abra offline.

Se o celular não abrir o endereço, o firewall do computador provavelmente bloqueia a porta (por exemplo `sudo ufw allow from 192.168.0.0/16 to any port 5173 proto tcp`, ajustando a sub-rede), ou o Wi-Fi isola os aparelhos entre si (redes de convidados). Alternativas: um túnel HTTPS temporário (`cloudflared tunnel --url https://localhost:5173 --no-tls-verify`, iniciando o Vite com `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=.trycloudflare.com`; ele expõe o servidor de desenvolvimento à internet enquanto estiver aberto) ou, no Android com depuração USB, `adb reverse tcp:5173 tcp:5173` e abrir `https://localhost:5173`.

## 4. Esta documentação

```bash
cd website
npm ci
npm start                # servidor de desenvolvimento
npm run build            # gera os dois idiomas
```

A documentação é bilíngue: o português fica em `website/docs/` e o inglês em `website/i18n/en/docusaurus-plugin-content-docs/current/`. O script `scripts/checar-traducao.py` falha o CI se as duas versões não tiverem a mesma estrutura.
