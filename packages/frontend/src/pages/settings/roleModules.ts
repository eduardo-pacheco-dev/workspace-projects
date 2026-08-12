export const ROLE_TYPES = [
  'master',
  'admin',
  'supervisor',
  'coordenador',
  'analista',
  'technician',
  'user',
] as const

export type RoleType = (typeof ROLE_TYPES)[number]

export const roleOptions: { value: RoleType; label: string }[] = [
  { value: 'master', label: 'Master' },
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'analista', label: 'Analista' },
  { value: 'technician', label: 'Técnico' },
  { value: 'user', label: 'Usuário' },
]

export const roleLabels: Record<string, string> = roleOptions.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {},
)

export const ALL_ROLE_MODULES: { value: string; label: string }[] = [
  { value: '/tasks', label: 'Tarefas' },
  { value: '/service-orders', label: 'Ordens de Serviço' },
  { value: '/collaborators', label: 'Colaboradores' },
  { value: '/stations', label: 'Estações' },
  { value: '/radio-links', label: 'Enlaces de Rádio' },
  { value: '/projects', label: 'Projetos' },
  { value: '/clients', label: 'Clientes' },
  { value: '/pdca', label: 'PDCA' },
  { value: '/users', label: 'Usuários' },
  { value: '/attachments', label: 'Anexos' },
  { value: '/comments', label: 'Comentários' },
  { value: '/lpus', label: 'LPU' },
  { value: '/teams', label: 'Equipes' },
]

const allModuleValues = ALL_ROLE_MODULES.map((m) => m.value)

export const DEFAULT_ROLE_MODULES: Record<string, string[]> = {
  admin: [...allModuleValues],
  supervisor: allModuleValues.filter((v) => v !== '/users'),
  coordenador: allModuleValues.filter((v) => v !== '/users'),
  analista: [
    '/tasks',
    '/service-orders',
    '/collaborators',
    '/stations',
    '/radio-links',
    '/projects',
    '/clients',
    '/pdca',
    '/lpus',
    '/attachments',
    '/comments',
  ],
  technician: [
    '/tasks',
    '/service-orders',
    '/stations',
    '/radio-links',
    '/projects',
    '/pdca',
    '/attachments',
    '/comments',
  ],
  user: [
    '/tasks',
    '/service-orders',
    '/stations',
    '/radio-links',
    '/projects',
    '/clients',
    '/attachments',
    '/comments',
  ],
  master: [],
}

export const DEFAULT_USER_MODULES = DEFAULT_ROLE_MODULES.user
