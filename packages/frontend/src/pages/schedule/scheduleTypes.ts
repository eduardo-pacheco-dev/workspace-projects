export interface ScheduleEvent {
  id: number
  title: string
  description: string | null
  startAt: string | null
  endAt: string | null
  location: string | null
  client: string | null
  assignedTo: string | null
  status: string
}

export type ScheduleStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export const statusOptions: { value: ScheduleStatus; label: string }[] = [
  { value: 'scheduled', label: 'Agendado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
]

export const statusLabels: Record<string, string> = statusOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const statusColors: Record<string, 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error'> = {
  scheduled: 'info',
  confirmed: 'success',
  in_progress: 'warning',
  completed: 'primary',
  cancelled: 'error',
}

export const statusCalendarColors: Record<string, string> = {
  scheduled: '#42a5f5',
  confirmed: '#66bb6a',
  in_progress: '#ffa726',
  completed: '#26a69a',
  cancelled: '#ef5350',
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

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
