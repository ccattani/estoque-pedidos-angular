# Estoque & Pedidos – Angular

## Visão geral
Sistema de gestão de produtos, pedidos e estoque desenvolvido em Angular,
com foco em arquitetura, regras de negócio e qualidade.

## Funcionalidades
- CRUD de Produtos
- Pedidos com confirmação e baixa automática de estoque
- Movimentações de estoque (IN / OUT / ADJUST)
- Dashboard com KPIs e alertas
- Feedback de ações (toast)
- Testes unitários + CI

## Stack
- Angular (standalone, signals)
- TypeScript
- SCSS
- Jasmine/Karma
- GitHub Actions

## Como rodar
npm install
ng serve

## Testes
ng test --watch=false

## Deploy (opções simples)

### Railway (API + Postgres)
1. Crie um novo projeto no Railway e adicione um banco PostgreSQL (free tier).
2. Defina a variável `DATABASE_URL` nas configurações do serviço com a URL do banco.
3. Faça o deploy do servidor (`server/`) e configure o comando de start como `npm run start`.

### Render (API + Postgres)
1. Use o `render.yaml` na raiz para provisionar um Web Service e um Postgres.
2. O `Dockerfile` está em `server/Dockerfile` e já compila o TypeScript.
3. O Render injeta `DATABASE_URL` automaticamente via `fromDatabase`.

### Supabase (banco) + Render/Railway (API)
1. Crie um projeto no Supabase e copie a string de conexão Postgres.
2. Configure `DATABASE_URL` no serviço da API (Render/Railway).

## Variáveis de ambiente
`server/.env` deve conter:
```
DATABASE_URL="postgresql://user:password@localhost:5432/estoque_pedidos"
```

## Decisões técnicas
- Separação core / shared / features
- Estado local com services + signals
- Regras de negócio centralizadas em services
