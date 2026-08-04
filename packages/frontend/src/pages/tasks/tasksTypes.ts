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
