---
id: seguranca
title: Segurança
sidebar_position: 4
---

# Segurança

Esta página registra o que a API protege hoje, as correções feitas na revisão pós-formatura e o que ainda falta.

## Proteções atuais

- **Senhas** com `bcryptjs` (custo 10); mínimo de 8 caracteres.
- **JWT** HS256 de 24 horas, assinado com `JWT_SECRET` (biblioteca `jose`).
- **Rotas sensíveis** (`/api/analytics`, `/api/feedback`, `/api/notifications/send-notification`) exigem token.
- **`userId` do feedback vem do token**, não do corpo da requisição, para ninguém avaliar em nome de outro.
- **Validação** de nota (1 a 5), de `projectId` e do tamanho do comentário (2000 caracteres); corpo JSON limitado a 100 KB.
- **Helmet** (cabeçalhos de segurança) e **limite de tentativas** em login e cadastro.
- **CORS** só para as origens de `ALLOWED_ORIGINS`.
- **TLS do banco verificado** por padrão (`DB_SSL_REJECT_UNAUTHORIZED=true`).
- Consultas sempre **parametrizadas** (sem concatenação de SQL).

## O que foi corrigido

| Problema encontrado | Correção |
|---|---|
| `jsonwebtoken` usado no código mas ausente do `package.json` | Troca por `jose` declarado como dependência. |
| `/api/analytics` e `/api/notifications` abertas | Exigem JWT. |
| Feedback gravava na coluna `comments`, que não existe (`comment`) | Coluna corrigida. |
| Feedback aceitava `userId` do corpo | `userId` vem do token. |
| Visualização de projeto sempre registrada como usuário 1 | Usa o usuário do token ou `NULL`. |
| `rejectUnauthorized: false` desligava a verificação TLS | Verificação ligada por padrão. |
| `bcrypt` nativo falhava ao compilar em Node recentes | Troca por `bcryptjs`. |

## O que ainda falta

- **Papéis de usuário**: qualquer conta autenticada lê o analytics e envia push. Falta um papel de administrador.
- **Configuração do Firebase no código**: `src/firebase.js` e `firebase-messaging-sw.js` têm a chave de API e a VAPID pública. São identificadores públicos por desenho, mas devem ter restrição de origem no console do Firebase.
- **Token no `localStorage`**: exposto a XSS. Um cookie `HttpOnly` seria mais seguro.
- **Proxies CORS públicos** para vídeos do S3 (ver [AR e QR Code](ar-e-qr)).
- **Testes automatizados** de autorização.
- **Histórico do Git** com o e-mail pessoal do autor nos commits antigos.

## Relatar uma vulnerabilidade

Use o [relato privado de vulnerabilidades do GitHub](https://github.com/EttoreCSenatore/varhub-client/security/advisories/new). Não abra issue pública com detalhes.
