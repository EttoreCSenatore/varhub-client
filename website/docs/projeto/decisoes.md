---
id: decisoes
title: Registro de decisões
sidebar_position: 1
---

# Registro de decisões

Cada linha é uma decisão, com data e motivo. Se uma decisão muda, a antiga é marcada como **substituída** e uma nova linha entra, preservando o histórico. As decisões partem das escolhas feitas ao longo do projeto; veja também o [Roadmap](../roadmap).

| # | Data | Decisão | Motivo | Estado |
|---|---|---|---|---|
| 001 | 2026-11-17 | Manter **dois repositórios** (`varhub-client` e `varhub-server`); a documentação fica no cliente e cobre os dois | Cada um tem seu deploy, histórico e links públicos; juntar quebraria tudo isso sem ganho | Aceita |
| 002 | 2026-11-17 | Documentação em **Docusaurus**, português como padrão e inglês, no mesmo padrão dos outros projetos | Padrão já usado nos outros repositórios; público brasileiro e internacional | Aceita |
| 003 | 2026-11-17 | Licença **AGPL-3.0-or-later** (código) e **CC BY-SA 4.0** (documentação), no lugar da MIT | Software livre com copyleft de rede, igual aos outros projetos; quem hospedar uma versão modificada compartilha o código | Aceita (substitui a MIT) |
| 004 | 2026-11-17 | Galeria e páginas de projeto **públicas**; conta é opcional | Um QR Code no evento não pode exigir cadastro; era o maior obstáculo do app | Aceita |
| 005 | 2026-11-17 | Feedback **anônimo**, com limite de requisições e resumo público sem dados do autor | Reduz a fricção e protege a privacidade; o limite contém abuso | Aceita |
| 006 | 2026-11-17 | Eventos de uso por `POST /api/events` com lista fixa de ações, no lugar de registrar em `GET` | Um `GET` que grava é fácil de inflar e de rastrear; a lista fixa evita dados arbitrários | Aceita |
| 007 | 2026-11-17 | Papéis **visitante** e **administrador**; o papel é conferido no banco; promoção só por script | Quem for rebaixado perde o acesso na hora; nenhuma rota pública cria administradores | Aceita |
| 008 | 2026-11-17 | JWT com `jose` e senhas com `bcryptjs` (custo 12) | `jsonwebtoken` não estava declarado e `bcrypt` nativo não compila em Node novo | Aceita |
| 009 | 2026-11-17 | PostgreSQL com **migrações SQL** próprias, sem ORM | O esquema é pequeno; SQL explícito é auditável e as migrações rodam duas vezes sem erro | Aceita |
| 010 | 2026-11-17 | `<model-viewer>` para 3D e AR, no lugar do visualizador WebXR próprio | Funciona no Android e no iPhone (Quick Look); o visualizador próprio só rodava no Chrome do Android | Aceita |
| 011 | 2026-11-17 | Visualizador de vídeo 360° próprio, em Three.js, e remoção do A-Frame | O A-Frame pesava cerca de 1 MB e trazia uma dependência buscada do GitHub | Aceita |
| 012 | 2026-11-17 | Leitor de QR Code com `jsQR` e foto como alternativa; remoção do `html5-qrcode` | Uma biblioteca só, mais leve, e funciona sem câmera | Aceita |
| 013 | 2026-11-17 | **PWA**, não app nativo | Abre direto pelo QR Code, sem instalar nada; um só código para todos os aparelhos | Aceita |
| 014 | 2026-11-17 | Remover o cliente Firebase; notificações push virão por Web Push (R5) | O código nunca rodava e deixava chaves no repositório; Web Push não depende de fornecedor | Aceita |
| 015 | 2026-11-17 | Em desenvolvimento, o Vite repassa `/api` ao servidor; em produção usa `VITE_API_URL` ou o Caddy | Mesma origem evita CORS e conteúdo misto no celular | Aceita |
| 016 | 2026-11-17 | Marca configurável por variáveis de ambiente no build (`VITE_BRAND_NAME` e outras) | Qualquer organização adapta sem editar código; uma tela no painel virá em R4 | Aceita (provisória) |
| 017 | 2026-11-17 | Reescrever o histórico dos dois repositórios para o e-mail noreply do GitHub | O e-mail pessoal estava nos commits públicos; a reescrita foi feita com backup | Aceita (feita) |
| 018 | 2026-11-17 | Testes de integração contra um PostgreSQL de verdade (`node:test`) | Pega erros de SQL e de permissão que um banco simulado esconde | Aceita |
| 019 | 2026-11-17 | `npm audit` e auditoria de licenças (compatíveis com a AGPL) no CI | Dependências com vulnerabilidades altas já tinham aparecido; a licença precisa continuar válida | Aceita |
| 020 | 2026-11-21 | Comparar com o Kaladrius e seguir um roadmap R1 a R7 | Ele é bem mais maduro em operação, segurança e releases; copiamos o que serve e deixamos o resto | Aceita |
| 021 | 2026-11-21 | Não copiar pacotes `.deb`/`.rpm`, autoatualização com rollback, app nativo nem 2FA obrigatório | Pesados demais ou excessivos para um mostruário de AR | Aceita |
| 022 | 2026-11-21 | **Uma instalação por organização** | Mais simples; é o que o Kaladrius faz. Várias organizações em uma instalação ficam para depois, se houver demanda | Aceita |
| 023 | 2026-11-22 | Produção com **Docker Compose e Caddy**; o banco sem porta publicada; imagens no GHCR fixadas por digest | Mesmo ambiente local e em produção, HTTPS automático e superfície de ataque mínima | Aceita |
| 024 | 2026-11-22 | Backup com `pg_dump` verificado, 30 dias de retenção e **teste de restauração no CI** | Um backup que nunca foi restaurado não é um backup | Aceita |
| 025 | 2026-11-22 | O reset da demonstração só roda com `DEMO_MODE=1` | Apaga o banco; precisa ser impossível rodar por engano em uma instalação real | Aceita |
| 026 | 2026-11-22 | Actions fixadas por commit e comandos `docker` simples no CI | Uma tag que se move não pode mudar o que roda com as credenciais do repositório; menos actions de terceiros | Aceita |
| 027 | 2026-11-22 | SemVer e `releases.yaml` como fonte única; o CI cria a tag e o Release | Ninguém precisa lembrar de publicar; o histórico aparece no app e no GitHub | Aceita |
