---
id: api
title: API
sidebar_position: 3
---

# API

Base: `http://localhost:5000` em desenvolvimento. Respostas em JSON; erros têm o formato `{"message": "..."}`. 🔒 exige `Authorization: Bearer <token>`; 🛡️ exige que o usuário seja administrador (o papel é conferido no banco a cada requisição).

## Rotas

| Método e caminho | Acesso | Descrição |
|---|---|---|
| `GET /health` | público | Estado do servidor e do banco. |
| `POST /api/auth/register` | público | Cria conta (`name`, `email`, `password` de 8 a 128 caracteres). |
| `POST /api/auth/login` | público | Retorna `token` JWT e o usuário (com `role`). |
| `GET /api/auth/me` | 🔒 | Usuário do token, para restaurar a sessão. |
| `GET /api/projects` | público | Projetos publicados. Filtros `type` e `q`. |
| `GET /api/projects/:id` | público | Um projeto publicado. |
| `GET /api/projects/:id/feedback` | público | Média, total e comentários recentes, sem dados do autor. |
| `POST /api/feedback` | público | `projectId`, `rating` (1 a 5) e `comments`. O token, se houver, vincula o usuário. |
| `POST /api/events` | público | `action` (`project_view`, `qr_scan`, `ar_launch`, `video_play`, `share`) e `projectId`. |
| `GET /api/admin/projects` | 🛡️ | Todos os projetos, inclusive rascunhos e arquivados. |
| `POST /api/projects` | 🛡️ | Cria projeto. |
| `PUT /api/projects/:id` | 🛡️ | Atualiza projeto (use `status: "archived"` para retirar). |
| `GET /api/analytics/summary` | 🛡️ | Totais, métricas por projeto e atividade dos últimos 14 dias. |
| `GET /api/analytics` | 🛡️ | Registro bruto de eventos (últimos 500). |
| `POST /api/notifications/send-notification` | 🛡️ | Envia push (`token`, `title`, `body`) pelo Firebase. |

### Formato de um projeto

```json
{
  "id": 1,
  "title": "Astronaut (3D model)",
  "description": "A 3D model you can rotate...",
  "type": "model",
  "status": "published",
  "thumbnail_url": "https://.../Astronaut.webp",
  "model_url": "https://.../Astronaut.glb",
  "ios_model_url": "https://.../Astronaut.usdz",
  "video_url": null,
  "page_url": null,
  "avg_rating": 4,
  "feedback_count": 1
}
```

URLs devem ser `http` ou `https`; qualquer outro esquema (como `javascript:`) é recusado.

## Exemplo

```bash
curl -X POST http://localhost:5000/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{"projectId":1,"rating":5,"comments":"Muito bom!"}'
```

## Erros

| Código | Quando |
|---|---|
| `400` | Corpo inválido (campo ausente, e-mail, senha curta, nota fora de 1 a 5, URL inválida, tipo desconhecido). |
| `401` | Sem token, token inválido ou expirado, credenciais erradas. |
| `403` | Usuário autenticado, mas sem papel de administrador. |
| `404` | Rota, projeto inexistente ou não publicado. |
| `409` | Já existe uma conta com esse e-mail. |
| `413` | Corpo maior que 100 KB. |
| `429` | Limite de requisições: 30 por 15 min em `/api/auth`, 20 por hora em feedback, 300 por 15 min em eventos. |
| `500` | Erro interno; a mensagem é genérica. |
