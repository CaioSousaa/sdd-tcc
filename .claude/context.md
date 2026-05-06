# SDD — Contexto do Projeto

Projeto de TCC. Monorepo com backend em Express/TypeScript e frontend em Next.js/React.

## Stack

### Backend (`sdd-backend/`)
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5
- **Linguagem**: TypeScript 6
- **Banco**: MongoDB via Mongoose (ainda não adicionado)
- **Auth**: JWT (ainda não adicionado)
- **Dev**: `npm run dev` (nodemon + ts-node) na porta definida em `.env` (padrão 3000)

### Frontend (`sdd-frontend/`)
- **Framework**: Next.js 16 — App Router (cada pasta em `app/` é uma rota)
- **UI**: React 19 + Tailwind CSS v4
- **Linguagem**: TypeScript 5
- **HTTP**: Axios com interceptor de autenticação (a criar em `lib/axios.ts`)
- **Dev**: `npm run dev`

> **Atenção**: O Next.js 16 tem breaking changes em relação a versões anteriores.
> Antes de gerar código Next.js, leia os guias em `node_modules/next/dist/docs/`.

## Design

- **Cor primária**: `amber-400`
- **Cor de fundo**: `zinc-900`
- Tema escuro por padrão

## Estrutura de pastas

### Backend
```
src/
├── main/               # Ponto de entrada da aplicação
├── routes/             # Rotas por domínio
├── modules/            # Módulos de domínio (Clean Architecture)
├── infra/
│   └── mongo/schemas/  # Schemas do Mongoose
├── config/             # Configurações globais (ex: JWT)
├── shared/
│   └── http/           # Middlewares
└── adapters/           # Utilitários compartilhados
```

### Frontend
```
app/                    # App Router — cada pasta é uma rota
├── globals.css
├── layout.tsx
└── page.tsx
components/             # Componentes reutilizáveis
types/
└── index.ts            # Tipos compartilhados
lib/
└── axios.ts            # Instância do Axios com interceptor de auth
```
