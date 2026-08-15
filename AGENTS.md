# AGENTS.md

Guia de convenções para agentes de IA que trabalham neste repositório.

## Visão geral

Monorepo npm workspaces (`packages/*`) de um sistema de gestão de telecomunicações:

- `packages/backend` — NestJS 10 + TypeORM + MySQL/MariaDB (ou SQL.js), JWT, class-validator.
- `packages/frontend` — React 18 + Vite + MUI, axios, React Router, Zod.

UI e mensagens em **pt-BR**. Ao adicionar textos, use português brasileiro.

## Comandos

```bash
npm install                        # instalar dependências (workspaces)
npm run dev                        # backend (3001) + frontend (5173)
npm run build                      # build backend + frontend
npm run build -w packages/backend  # só backend
npm run build -w packages/frontend # só frontend

# Testes (backend, jest)
npm test -w packages/backend
npm test -w packages/backend -- --testPathPattern <modulo>
npm run test:cov -w packages/backend

# Migrations / seed
npm run migration:run -w packages/backend
npm run migration:revert -w packages/backend
npm run seed -w packages/backend

# Ambiente
cp packages/backend/.env.example packages/backend/.env
```

## Convenções de backend (`packages/backend/src`)

### Estrutura de módulo

Cada módulo tem a pasta própria, ex. `projects/`:

```
projects/
├── project.entity.ts
├── project-document.entity.ts     # sub-entidade (relação)
├── projects.module.ts
├── projects.controller.ts
├── projects.service.ts
├── projects.service.spec.ts       # unitários (repos mockados)
├── projects.controller.spec.ts    # integração (SQL.js + Supertest)
└── dto/
    ├── create-project.dto.ts
    └── update-project.dto.ts      # extends PartialType(Create...)
```

Registrar o módulo em `app.module.ts` (import + `imports` array). DTOs usam **class-validator**; o `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` global aplica.

### Entidades (TypeORM)

- Tabela explícita quando o nome difere: `@Entity('pdca_action')`.
- Strings sempre `@Column({ type: 'text' })` (NOT NULL) ou `nullable: true`.
- Status/enums como `@Column({ type: 'text', default: 'ativo' })`.
- FK: coluna `@Column({ type: 'integer' })` + `@ManyToOne(() => X, { onDelete: 'CASCADE' })` + `@JoinColumn({ name: 'xxxId' })`.
- Timestamps `@CreateDateColumn()` / `@UpdateDateColumn()`.
- Colunas camelCase (ex.: `projectId`, `dataInicio`, `folderId`).

### Migrations (`src/migrations`)

- Nome: `<timestamp>-<NomePascal>.ts`, classe `NomePascal<timestamp>`.
- PK `id INTEGER PRIMARY KEY AUTO_INCREMENT`; texto `TEXT NOT NULL`/`TEXT NULL`; timestamps `DATETIME ... DEFAULT CURRENT_TIMESTAMP`.
- FK: `CONSTRAINT FK_<tabela>_<coluna> FOREIGN KEY (...) REFERENCES <pai>(id) ON DELETE CASCADE`.
- `CREATE INDEX IF NOT EXISTS IDX_<tabela>_<coluna> ON <tabela> (<coluna>)`.
- `down` = `DROP TABLE IF EXISTS <tabela>`.

### Service / Controller

- Service: injeção `@InjectRepository(...)`; métodos `create/findAll/findById/update/delete`; `findAll` retorna `{ data, total }` com QueryBuilder, filtros `andWhere`, whitelist de sort (`allowedSort`), `skip/take`.
- `findById` lança `NotFoundException('... não encontrado')`.
- Controller: `@Controller('<plural>')`, rotas aninhadas `@Get(':id/sub')`, `@Param('id', ParseIntPipe)`.
- Segurança: o `JwtRoleGuard` global protege tudo exceto `/auth`. Para liberar módulo a não-master, adicionar o prefixo em `USER_ALLOWED_PREFIXES` em `common/guards/jwt-role.guard.ts` (e o módulo em `USER_MODULES` no `App.tsx`). O backend filtra por empresa do usuário.

## Convenções de frontend (`packages/frontend/src`)

### Páginas por módulo (`pages/<modulo>/`)

- `pages/<modulo>/<X>Page.tsx` — lista (Container mt:4, header h4 + botão "Novo", Stack de filtros, Table + TablePagination, `api.get` normalizando `res.data.data ?? []`).
- `<X>Modal.tsx` — props `{ open, editId?, onClose, onSaved }`; `isEdit = Boolean(editId)`; carrega opções em `useEffect([open])` e o registro em `useEffect([open, editId])`; valida com Zod (`fieldErrors`); sucesso → `showToast(...)`, `onSaved()`, `onClose()`.
- `<X>Detail.tsx` — `useParams`, callback `load`, guardas de loading/erro, modais no fim da árvore.

### Padrões

- API: `import api from '../../services/api'` (axios, injeta Bearer token, redireciona a `/signin` em 401).
- Toast: `useToast()` → `showToast(msg)` sucesso / `showToast(msg, 'error')` erro.
- Confirmação: `ConfirmDialog` (`open`, `title`, `message`, `onConfirm`, `onClose`) em vez de `confirm()`.
- Tipos/opções por módulo em arquivo `<modulo>Types.ts` (interface + `XOptions`/`XLabels`/`XColors`).

### Estado global (Zustand)

- Usar **Zustand** (`zustand`) para estado global compartilhado; evitar prop drilling de contexto de app.
- Stores em `stores/<modulo>.ts`, criados com `create()`. Seletores usam `useStore((s) => s.campo)` (evitar retornar o store inteiro para não causar re-renders).
- Ações sempre atualizam estado de forma imutável (ex.: `set((s) => ({ itens: [...s.itens, novo] }))`).
- Para estado apenas local de página/modal, continuar usando `useState`/`useEffect` — Zustand é para estado compartilhado entre componentes.

### Rotas e navegação

- Rotas em `App.tsx`; página protegida dentro de `<Route element={<ProtectedLayout />}>`; adicionar prefixo em `USER_MODULES` para não-master.
- Item de menu em `components/Layout.tsx` (`masterItems` e `userItems`).

## Testes

- `*.service.spec.ts` — unitário: `Test.createTestingModule`, repos mockados via `getRepositoryToken`, mock de `createQueryBuilder`.
- `*.controller.spec.ts` — integração: `TypeOrmModule.forRoot({ type: 'sqljs', ... :memory:, synchronize: true })` + `forFeature`, `ValidationPipe` igual ao real, Supertest. Relações precisam das entidades registradas.
- Cobertura por módulo (meta ≥ 95% em lines/stmts):
  ```bash
  npm test -w packages/backend -- --testPathPattern <modulo> --coverage \
    --collectCoverageFrom="<modulo>/**/*.ts" \
    --collectCoverageFrom="!<modulo>/**/*.spec.ts" \
    --collectCoverageFrom="!<modulo>/**/*.module.ts"
  ```

## Deploy

- `docker-compose.yml` — dev: db (MariaDB) + backend (3001) + frontend (5173). O backend Docker roda migrations no start.
- `deploy.sh` — produção (VPS + PM2): atualiza branch `production`, `npm install`, build, migrations, `pm2 restart ecosystem.config.js`, Nginx.
- `ecosystem.config.js` — backend roda `dist/src/main.js`; frontend roda `vite preview` (5173).
- Erros comuns: se o app reinicia com `ReferenceError`, verificar `dist` desatualizado (`npm run build` + `pm2 restart`) e migrations pendentes.

## Notas

- Não commitar segredos (`.env` nunca versionado; há apenas `.env.example`).
- Siga o estilo existente ao criar código (mesmos imports, padrões de Grid/TextField, nomes pt-BR).
