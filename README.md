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

## Decisões técnicas
- Separação core / shared / features
- Estado local com services + signals
- Regras de negócio centralizadas em services
