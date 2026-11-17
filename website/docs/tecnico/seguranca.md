---
id: seguranca
title: Segurança
sidebar_position: 4
---

# Segurança

O que a aplicação protege hoje, o que foi corrigido na revisão pós-formatura e o que ainda falta.

## Proteções atuais

- **Senhas** com `bcryptjs` (custo 12), de 8 a 128 caracteres; login com comparação de tempo constante mesmo para e-mails inexistentes.
- **JWT** HS256 de 24 horas (`jose`), com `JWT_SECRET` de pelo menos 16 caracteres (o servidor não sobe em produção sem ele).
- **Papéis**: rotas de administração conferem o papel **no banco**, então um administrador rebaixado perde o acesso na hora.
- **Anônimo, mas limitado**: feedback e eventos aceitam visitantes sem conta, com limite de requisições por IP e lista fixa de ações.
- **Privacidade do feedback**: o resumo público nunca mostra quem escreveu.
- **Validação**: nota de 1 a 5, tamanhos máximos, tipo e status por lista, e URLs só `http(s)` (impede `javascript:` em links).
- **Helmet**, corpo JSON limitado a 100 KB, **CORS** só para `ALLOWED_ORIGINS` e **TLS do banco verificado** fora do localhost.
- **SQL parametrizado** em todas as consultas.
- **QR Codes de terceiros**: o leitor nunca abre um link sozinho; mostra o endereço e pede um toque.
- O código do app não carrega scripts de CDN. (O `<model-viewer>` pode buscar decodificadores Draco/KTX2 do `gstatic.com` quando um modelo os usa.)
- `npm audit` roda no CI do servidor e falha para vulnerabilidades altas.

## O que foi corrigido na revisão

| Problema encontrado | Correção |
|---|---|
| `jsonwebtoken` usado e ausente do `package.json`; `bcrypt` nativo falhava em Node novo | `jose` e `bcryptjs`, declarados. |
| `/api/analytics` e `/api/notifications` abertas | Só administradores. |
| Feedback gravava na coluna errada e confiava no `userId` do corpo | Coluna corrigida; usuário vem do token. |
| Cada visualização era contada como o usuário 1 | Eventos explícitos, anônimos ou do usuário do token. |
| TLS do banco sem verificação | Verificação ligada por padrão. |
| Projetos da API apareciam em branco (nomes de campo diferentes) | Formato único normalizado. |
| Script `webxr-polyfill@latest` carregado de CDN sem versão fixa | Removido. |
| Chaves do Firebase no código e código de push que nunca rodava | Removidos do cliente. |
| Dependências do servidor com vulnerabilidades altas | `npm audit fix`; auditoria no CI. |
| E-mail pessoal nos commits antigos | Histórico dos dois repositórios reescrito para o e-mail noreply do GitHub. |

## O que ainda falta

- **Token no `localStorage`**: exposto a XSS. Um cookie `HttpOnly` seria mais seguro.
- **Comentários públicos sem moderação**: o React escapa o texto, mas falta uma forma de ocultar abusos.
- **Cadastro sem verificação de e-mail**.
- **Promoção a administrador** só por script (`npm run admin:promote`), de propósito.
- **Cabeçalho de CSP** estrito: o `<model-viewer>` e o Three.js exigem ajustes finos.
- **Testes de ponta a ponta** no navegador.

## Relatar uma vulnerabilidade

Use o [relato privado de vulnerabilidades do GitHub](https://github.com/EttoreCSenatore/varhub-client/security/advisories/new). Não abra issue pública com detalhes.
