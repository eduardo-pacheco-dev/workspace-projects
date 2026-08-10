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

export const DEFAULT_USER_MODULES = ALL_ROLE_MODULES.map((m) => m.value)
