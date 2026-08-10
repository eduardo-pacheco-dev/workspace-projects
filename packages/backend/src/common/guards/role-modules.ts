export const ROLE_TYPES = [
  'master',
  'admin',
  'supervisor',
  'coordenador',
  'analista',
  'technician',
  'user',
] as const;

export const ALL_ROLE_MODULES = [
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
];

const allModuleValues = ALL_ROLE_MODULES.map((m) => m.value);

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
  user: [...allModuleValues],
  master: [],
};

export const DEFAULT_USER_ALLOWED_PREFIXES = DEFAULT_ROLE_MODULES.user;

export const roleModulesKey = (role: string): string => `role_modules_${role}`;
