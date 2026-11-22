---
id: instalacao
title: Instalação em um servidor
sidebar_position: 1
---

# Instalação em um servidor

O jeito recomendado de rodar o VARHub é com **Docker Compose**: PostgreSQL, API e o site (servido pelo Caddy, que obtém e renova o certificado HTTPS sozinho). Uma instalação atende **uma organização**.

## Requisitos

- Um servidor Linux com Docker e Docker Compose v2 (1 GB de RAM basta para começar).
- Um **domínio** apontando para o servidor e as portas **80 e 443** abertas.
- Acesso à internet para baixar as imagens de `ghcr.io`.

## Passo a passo

```bash
git clone https://github.com/EttoreCSenatore/varhub-client /opt/varhub
cd /opt/varhub
cp deploy/.env.example deploy/.env      # preencha SITE_ADDRESS, POSTGRES_PASSWORD e JWT_SECRET
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d
```

Gere os segredos com `openssl rand -hex 32`. O arquivo `deploy/.env` fica só no servidor e **nunca** vai para o Git.

Depois de subir:

1. Abra `https://seu-dominio`: o site aparece e o certificado é emitido na primeira visita.
2. Cadastre-se pelo app e promova a sua conta a administradora:

```bash
cd /opt/varhub
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec api node scripts/make-admin.js voce@exemplo.com
```

3. Entre no painel (`/admin`), cadastre os projetos e baixe os QR Codes.

## O que roda

| Serviço | Imagem | Função |
|---|---|---|
| `db` | PostgreSQL 17 (fixado por digest) | Dados. **Sem porta publicada**: só os outros contêineres chegam nele. |
| `api` | `ghcr.io/ettorecsenatore/varhub-server` | API. Aplica as migrações ao iniciar. |
| `web` | `ghcr.io/ettorecsenatore/varhub-web` | O PWA servido pelo Caddy, que também encaminha `/api` para a API. |

O Caddy já envia `Strict-Transport-Security`, `X-Content-Type-Options` e a política de permissões (a câmera só vale para o próprio site).

## Marca própria

As imagens publicadas usam o nome padrão. Para a sua marca, gere a sua imagem do site com os argumentos de build (`VITE_BRAND_NAME`, `VITE_ORG_NAME`, `VITE_TAGLINE`, `VITE_SOURCE_URL`) e aponte o Compose para ela. Veja [Adaptar ao seu negócio](../adaptar). Uma tela de configuração no painel, sem recompilar, está no [Roadmap](../roadmap).

## Demonstração pública (opcional)

Para um servidor **só de demonstração**, defina `DEMO_ADMIN_PASSWORD` no `deploy/.env` e instale o reset noturno: ele apaga os dados, recria projetos de exemplo, semanas de atividade simulada e a conta de administrador de demonstração. **Nunca faça isso em uma instalação com dados reais**; o script recusa rodar sem `DEMO_MODE=1`, que só o reset define.

```bash
sudo cp deploy/systemd/varhub-demo-reset.* /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now varhub-demo-reset.timer
```

## Desenvolvimento local

Para desenvolver, veja [Desenvolvimento](../tecnico/desenvolvimento).
