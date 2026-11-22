---
id: atualizacao-e-monitoramento
title: Atualização e monitoramento
sidebar_position: 3
---

# Atualização e monitoramento

## Atualizar

Defina `VARHUB_VERSION` no `deploy/.env` (por exemplo `2.1.0`, ou `latest` para seguir a `main`) e rode:

```bash
cd /opt/varhub
deploy/backup.sh                                  # sempre antes de atualizar
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml pull
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d
```

A API aplica as migrações do banco ao iniciar. Se uma migração falhar, o contêiner novo **não sobe** e o site fica sem API até você voltar à versão anterior (abaixo); por isso o backup vem antes.

### Voltar a uma versão anterior

Coloque a versão anterior em `VARHUB_VERSION` e rode `up -d` de novo. **As migrações não são desfeitas.** Por isso, em mudanças que apagam ou renomeiam colunas, lance primeiro uma versão compatível com o esquema antigo e o novo, e só depois remova o que sobrou. Se o esquema novo for incompatível, restaure o backup feito antes da atualização.

## Está no ar?

`GET /api/version` responde sem login com a versão instalada, e `GET /health` informa também o estado do banco (código 503 se ele não responde):

```bash
curl https://seu-dominio/api/version
# {"version":"2.0.0"}
```

O rodapé do site mostra a versão do app e da API.

## Alertas

Use qualquer monitor de disponibilidade (UptimeRobot, Uptime Kuma, Healthchecks.io) apontando para `/health`. Para o backup, crie uma verificação "push" no Healthchecks.io e coloque o endereço em `MONITOR_BACKUP_URL`: o script avisa a cada backup bem-sucedido e na falha, e o serviço alerta você se o aviso não chegar no prazo.

## Logs

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml logs -f api web
```

A API registra só erros internos e a inicialização; não registra endereços de IP nem o conteúdo das requisições.
