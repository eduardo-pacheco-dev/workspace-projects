# MyApp

Monorepo com **NestJS** (backend) e **React + Vite + MUI** (frontend).

## Estrutura

```
myapp/
├── packages/
│   ├── backend/          # NestJS + TypeORM (MySQL/MariaDB)
│   │   ├── src/
│   │   │   ├── auth/            # Autenticação (JWT)
│   │   │   ├── users/           # Usuários
│   │   │   ├── freelancers/     # Freelancers
│   │   │   ├── jobs/            # Trabalhos
│   │   │   ├── proposals/       # Propostas
│   │   │   ├── contracts/       # Contratos
│   │   │   ├── lpu/             # LPU (Licenças/Processos)
│   │   │   ├── service-orders/  # Ordens de Serviço
│   │   │   ├── finance/         # Finanças
│   │   │   ├── stations/        # Estações
│   │   │   ├── radio-links/     # Enlaces de Rádio
│   │   │   ├── projects/        # Projetos
│   │   │   ├── clients/         # Clientes
│   │   │   ├── schedule/        # Agenda
│   │   │   ├── tasks/           # Tarefas
│   │   │   ├── ms-project/      # Cronograma (MS Project)
│   │   │   └── seed/            # Seed automático (admin)
│   │   └── migrations/          # Migrações TypeORM
│   └── frontend/         # React + Vite + MUI
│       └── src/
│           ├── contexts/ # AuthContext (login/logout/token)
│           ├── services/ # api.ts (axios interceptor)
│           ├── components/ # Layout, menus
│           └── pages/    # Telas de cada módulo
├── ecosystem.config.js   # PM2 deploy
└── pnpm-workspace.yaml
```

## Pré-requisitos

- Node.js >= 18
- pnpm

## Instalação

```bash
pnpm install
```

## Desenvolvimento

Sobe backend (3001) e frontend (5173) em paralelo:

```bash
pnpm dev
```

O Vite proxyia `/api` para o backend (com rewrite do prefixo).

## Build

```bash
pnpm build
```

## Seed

Ao iniciar, o backend cria automaticamente um usuário admin:

| Email | Senha |
|-------|-------|
| admin@admin.com | 123456 |

## Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro (name, email, password) |
| POST | `/auth/login` | Login (email, password) → JWT |
| POST | `/auth/forgot-password` | Solicitar reset (email) |
| POST | `/auth/reset-password` | Resetar senha (token, password) |
| GET/POST | `/schedule` | Agenda |
| GET/POST/PATCH/DELETE | `/tasks` | Tarefas |
| GET/POST/PATCH/DELETE | `/ms-project` | Cronograma (planos, tarefas, dependências, recursos, atribuições) |

## Frontend

| Rota | Página |
|------|--------|
| `/login` | Login |
| `/register` | Cadastro |
| `/forgot-password` | Recuperar senha |
| `/reset-password?token=` | Redefinir senha |
| `/` | Dashboard (protegida) |
| `/schedule` | Agenda |
| `/tasks` | Tarefas |
| `/ms-project` | Cronograma (MS Project) |

## Deploy (VPS com PM2)

```bash
# Instalar dependências
pnpm install

# Build
pnpm build

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
```
