export type MsProjectStatus = 'not_started' | 'on_track' | 'at_risk' | 'behind' | 'completed'
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'
export type ResourceType = 'work' | 'material' | 'cost'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface MsProjectSummary {
  id: number
  name: string
  description: string | null
  startDate: string | null
  endDate: string | null
  durationDays: number | null
  status: string
  workingDays: number[]
  createdAt: string
  updatedAt: string
}

export interface MsTask {
  id: number
  projectId: number
  name: string
  durationDays: number
  milestone: boolean
  percentComplete: number
  priority: string
  notes: string | null
  startDate: string | null
  finishDate: string | null
  critical: boolean
  slackDays: number | null
  position: number
}

export interface MsDependency {
  id: number
  projectId: number
  taskId: number
  predecessorTaskId: number
  type: string
  lagDays: number
}

export interface MsResource {
  id: number
  projectId: number
  name: string
  type: string
  email: string | null
  maxUnits: number
}

export interface MsAssignment {
  id: number
  projectId: number
  taskId: number
  resourceId: number
  units: number
  work: number | null
  actualWork: number
}

export interface MsProjectDetail extends MsProjectSummary {
  schedule: {
    startDate: string
    finishDate: string
    durationDays: number
    criticalTasks: number[]
  }
  tasks: MsTask[]
  dependencies: MsDependency[]
  resources: MsResource[]
  assignments: MsAssignment[]
}

export const msProjectStatusOptions: { value: MsProjectStatus; label: string }[] = [
  { value: 'not_started', label: 'Não iniciado' },
  { value: 'on_track', label: 'No prazo' },
  { value: 'at_risk', label: 'Em risco' },
  { value: 'behind', label: 'Atrasado' },
  { value: 'completed', label: 'Concluído' },
]

export const msProjectStatusLabels: Record<string, string> = msProjectStatusOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const msProjectStatusColors: Record<string, 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error'> = {
  not_started: 'default',
  on_track: 'info',
  at_risk: 'warning',
  behind: 'error',
  completed: 'success',
}

export const dependencyTypeOptions: { value: DependencyType; label: string }[] = [
  { value: 'FS', label: 'Término → Início (FS)' },
  { value: 'SS', label: 'Início → Início (SS)' },
  { value: 'FF', label: 'Término → Término (FF)' },
  { value: 'SF', label: 'Início → Término (SF)' },
]

export const dependencyTypeLabels: Record<string, string> = dependencyTypeOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const resourceTypeOptions: { value: ResourceType; label: string }[] = [
  { value: 'work', label: 'Trabalho' },
  { value: 'material', label: 'Material' },
  { value: 'cost', label: 'Custo' },
]

export const resourceTypeLabels: Record<string, string> = resourceTypeOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const taskPriorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
]

export const taskPriorityLabels: Record<string, string> = taskPriorityOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const taskPriorityColors: Record<string, 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
}

export const weekdayOptions: { value: number; label: string }[] = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

export const weekdayLabels: Record<number, string> = weekdayOptions.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {},
)

export const pad2 = (value: number) => String(value).padStart(2, '0')

export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

export const formatDate = (value: string | null) => {
  if (!value) return '-'
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR')
}

export const todayString = () => toDateString(new Date())

export function taskName(tasks: MsTask[], taskId: number): string {
  return tasks.find((t) => t.id === taskId)?.name || `#${taskId}`
}

export function resourceName(resources: MsResource[], resourceId: number): string {
  return resources.find((r) => r.id === resourceId)?.name || `#${resourceId}`
}

export function taskAssignments(
  assignments: MsAssignment[],
  resources: MsResource[],
  taskId: number,
): string {
  return (
    assignments
      .filter((a) => a.taskId === taskId)
      .map((a) => `${resourceName(resources, a.resourceId)} (${a.units}%)`)
      .join(', ') || '-'
  )
}
