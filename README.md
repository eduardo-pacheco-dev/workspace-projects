# Workspace Projects

Sistema de gestão para projetos de telecomunicações — monorepo com **NestJS** (backend) e **React + Vite + MUI** (frontend).

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 10, TypeORM, MySQL/MariaDB (ou SQL.js), JWT, class-validator |
| Frontend | React 18, Vite, MUI (Material UI), Axios, React Router, Zod |
| Infra | Docker Compose (dev), PM2 + Nginx (produção), GitHub Actions (opcional) |

## Estrutura

```
workspace-projects/
├── packages/
│   ├── backend/                  # NestJS + TypeORM
│   │   ├── src/
│   │   │   ├── auth/             # Autenticação (JWT, reset de senha)
│   │   │   ├── users/            # Usuários, perfis (master/user)
│   │   │   ├── companies/        # Empresas
│   │   │   ├── collaborators/    # Colaboradores/Freelancers
│   │   │   ├── clients/          # Clientes (+ responsáveis)
│   │   │   ├── projects/         # Projetos (+ estações, enlaces, documentos)
│   │   │   ├── pdca/             # Ciclos PDCA (Plan-Do-Check-Act)
│   │   │   ├── stations/         # Estações
│   │   │   ├── radio-links/      # Enlaces de Rádio
│   │   │   ├── service-orders/   # Ordens de Serviço
│   │   │   ├── finance/          # Finanças (contas, cartões, lançamentos)
│   │   │   ├── tasks/            # Tarefas
│   │   │   ├── ms-project/       # Cronograma (MS Project)
│   │   │   ├── schedule/         # Agenda
│   │   │   ├── jobs/             # Trabalhos
│   │   │   ├── proposals/        # Propostas
│   │   │   ├── contracts/        # Contratos
│   │   │   ├── lpu/              # LPU
│   │   │   ├── settings/         # Configurações
│   │   │   ├── attachments/      # Anexos (com pastas/tree por projeto)
│   │   │   ├── comments/         # Comentários
│   │   │   ├── teams/            # Equipes
│   │   │   ├── common/           # Guards (JWT/RBAC), pipes
│   │   │   ├── migrations/       # Migrações TypeORM
│   │   │   ├── seed/             # Seed automático
│   │   │   └── app.module.ts
│   │   └── scripts/              # create-user, seed
│   └── frontend/
│       └── src/
│           ├── contexts/         # AuthContext, ToastContext, ProjectContext
│           ├── services/         # api.ts (axios + interceptor JWT)
│           ├── components/       # Layout, ConfirmDialog, ProtectedRoute
│           ├── utils/            # format, phone, password
│           └── pages/            # Telas por módulo (auth, users, projects, pdca, ...)
├── docker-compose.yml            # db + backend + frontend
├── deploy.sh                     # Deploy em VPS (branch production)
├── ecosystem.config.js           # Config PM2
└── package.json                  # Workspaces npm
```

## Pré-requisitos

- Node.js >= 18
- npm (workspaces)
- MySQL/MariaDB (ou use Docker) — ou `DB_TYPE=sqljs` para SQL.js em memória/arquivo

## Configuração de ambiente

```bash
cp packages/backend/.env.example packages/backend/.env
# edite as credenciais do banco e o JWT_SECRET
```

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | 3001 | Porta do backend |
| `JWT_SECRET` | — | Segredo do JWT (defina em produção) |
| `DB_TYPE` | mysql | `mysql` ou `sqljs` |
| `DB_HOST` / `DB_PORT` | localhost / 3306 | Conexão do banco |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | — | Credenciais do banco |
| `SEED` | — | `true` força o seed mesmo em produção |

## Instalação

```bash
npm install
```

## Desenvolvimento

Sobe backend (3001) e frontend (5173) em paralelo:

```bash
npm run dev
```

O Vite proxyia `/api` para o backend (com rewrite do prefixo) e `/uploads` para os arquivos.

## Build

```bash
npm run build
```

## Testes (backend)

```bash
npm test -w packages/backend                 # suíte completa
npm test -w packages/backend -- --testPathPattern projects   # módulo específico
npm run test:cov -w packages/backend         # cobertura
```

Testes seguem o padrão por módulo: `*.service.spec.ts` (unitários, repos mockados) e `*.controller.spec.ts` (integração com SQL.js em memória + Supertest).

## Migrations

As migrations rodam automaticamente no startup do backend (`migrationsRun: true`). Também podem ser executadas manualmente:

```bash
npm run migration:run -w packages/backend
npm run migration:revert -w packages/backend
```

## Seed

Ao iniciar (fora de produção, ou com `SEED=true`), o backend popula dados de demonstração e cria o admin:

| Email | Senha |
|-------|-------|
| admin@admin.com | 123456 |

Para rodar manualmente:

```bash
npm run seed -w packages/backend
```

## Docker (desenvolvimento)

```bash
docker compose up --build
```

| Serviço | Porta |
|---------|-------|
| db (MariaDB) | 3306 |
| backend | 3001 |
| frontend | 5173 |

## Deploy em produção (VPS + PM2)

1. Faça merge das mudanças na branch `production`.
2. Rode o script (requer `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `GIT_REPO_URL`):

```bash
VPS_HOST=... VPS_USER=... VPS_SSH_KEY=... GIT_REPO_URL=https://github.com/<org>/workspace-projects ./deploy.sh
```

O script: atualiza a branch `production`, instala dependências, builda, roda migrations, reinicia o PM2 (`ecosystem.config.js`) e atualiza o Nginx.

## Rotas do Frontend

| Rota | Página |
|------|--------|
| `/signin`, `/signup`, `/forgot-password`, `/reset-password` | Autenticação |
| `/` | Dashboard |
| `/projects`, `/projects/:id` | Projetos |
| `/pdca`, `/pdca/:id` | Ciclos PDCA |
| `/clients`, `/clients/:id` | Clientes |
| `/stations`, `/stations/:id` | Estações |
| `/radio-links`, `/radio-links/:id` | Enlaces de Rádio |
| `/service-orders`, `/service-orders/:id` | Ordens de Serviço |
| `/collaborators`, `/collaborators/:id` | Colaboradores |
| `/tasks`, `/tasks/:id` | Tarefas |
| `/schedule` | Agenda |
| `/ms-project` | Cronograma |
| `/finance` | Finanças |
| `/companies`, `/companies/:id` | Empresas (master) |
| `/users`, `/profile` | Usuários e perfil |
| `/settings` | Configurações |

## API (resumo)

| Prefixo | Módulo |
|---------|--------|
| `/auth`, `/users` | Autenticação e usuários |
| `/projects` | Projetos + `/:id/{stations,radio-links,documents}` |
| `/pdca` | Ciclos PDCA + `/:id/actions` |
| `/clients` | Clientes + `/:id/responsaveis` |
| `/stations`, `/radio-links` | Estações e enlaces |
| `/attachments` | Anexos (+ download de pasta em ZIP) |
| `/comments` | Comentários |
| `/tasks`, `/schedule`, `/ms-project` | Tarefas, agenda, cronograma |
| `/finance`, `/companies`, `/collaborators`, `/teams` | Financeiro, empresas, colaboradores, equipes |

## RBAC

O `JwtRoleGuard` valida o JWT em todas as rotas (exceto `/auth`). Usuários não-master acessam apenas os módulos liberados (tarefas, OS, colaboradores, estações, enlaces, projetos, clientes, PDCA, anexos, comentários, etc.), sempre escopados à própria empresa. Perfil `master` tem acesso total.
