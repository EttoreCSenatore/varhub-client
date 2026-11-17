---
id: api
title: API
sidebar_position: 3
---

# API

Base: `http://localhost:5000` em desenvolvimento. Respostas em JSON. Rotas marcadas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>`.

## Rotas

| Método e caminho | Acesso | Descrição |
|---|---|---|
| `GET /` | público | Informações do serviço e lista de rotas. |
| `GET /health` | público | Estado do servidor e do banco. |
| `POST /api/auth/register` | público | Cria conta (`name`, `email`, `password` com 8+ caracteres). |
| `POST /api/auth/login` | público | Retorna `token` JWT e dados do usuário. |
| `GET /api/projects` | público | Projetos com URLs de AR (`marker_image_url`, `model_3d_url`). |
| `GET /api/projects/:id` | público | Um projeto; registra a visualização (com o usuário, se houver token). |
| `POST /api/feedback` | 🔒 | Envia `projectId`, `rating` (1 a 5) e `comments`. |
| `GET /api/analytics` | 🔒 | Registros de engajamento. |
| `POST /api/notifications/send-notification` | 🔒 | Envia push (`token`, `title`, `body`). |
| `GET /api/notifications/test-notification` | público | Exemplo de payload. |

## Exemplo

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"uma-senha-longa"}'
```

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {"id": 1, "email": "ana@example.com", "name": "Ana"}
}
```

## Erros

| Código | Quando |
|---|---|
| `400` | Corpo inválido (campos ausentes, e-mail, senha curta, nota fora de 1 a 5). |
| `401` | Sem token, token inválido ou expirado, credenciais erradas. |
| `404` | Rota ou projeto inexistente. |
| `429` | Muitas tentativas em `/api/auth` (30 por 15 minutos por IP). |
| `500` | Erro interno; em produção a mensagem é genérica. |
