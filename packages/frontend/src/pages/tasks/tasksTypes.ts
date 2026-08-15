export interface Task {
  id: number
  title: string
  description: string | null
  status: string
  priority: string
  dueAt: string | null
  project: string | null
  client: string | null
  assignedTo: string | null
  parentId?: number | null
  subtasks?: Task[]
  createdAt?: string
  updatedAt?: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskSortBy = 'id' | 'title' | 'status' | 'priority' | 'dueAt' | 'project' | 'client' | 'assignedTo'
export type SortOrder = 'ASC' | 'DESC'

export const TASK_COLUMNS: { id: TaskSortBy; label: string }[] = [
  { id: 'title', label: 'Título' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Prioridade' },
  { id: 'dueAt', label: 'Vencimento' },
  { id: 'project', label: 'Projeto' },
  { id: 'client', label: 'Cliente' },
  { id: 'assignedTo', label: 'Responsável' },
]

export interface ProjectOption {
  id: number
  nome: string
  cliente: string | null
}

export interface CollaboratorOption {
  id: number
  nome: string | null
  firstName?: string | null
  lastName?: string | null
}

export interface Attachment {
  id: number
  filename: string
  originalName: string
  mimetype: string
  size: number
}

export const collaboratorName = (c: CollaboratorOption) =>
  c.nome || [c.firstName, c.lastName].filter(Boolean).join(' ')

export const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
]

export const statusLabels: Record<string, string> = statusOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const statusColors: Record<string, 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error'> = {
  pending: 'default',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
}

export const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

export const priorityLabels: Record<string, string> = priorityOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const priorityColors: Record<string, 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
}

export const pad2 = (value: number) => String(value).padStart(2, '0')

export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

export const splitDateTime = (value: string | null) => {
  if (!value) return { date: '', time: '' }
  const [date, time] = value.split('T')
  return { date: date || '', time: time ? time.slice(0, 5) : '' }
}

export const joinDateTime = (date: string, time: string) => {
  if (!date) return ''
  return time ? `${date}T${time}` : date
}

export const formatDateTime = (value: string | null) => {
  if (!value) return '-'
  const { date, time } = splitDateTime(value)
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
  return time ? `${formattedDate} ${time}` : formattedDate
}
