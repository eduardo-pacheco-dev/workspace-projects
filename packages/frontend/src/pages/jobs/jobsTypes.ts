export interface Job {
  id: number
  title: string
  description: string
  budget: number
  budgetType: string
  status: string
  skills: string | string[]
  experienceLevel: string
  clientId: string
}

export const jobStatusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

export const jobStatusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  open: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
}

export const expLevelLabels: Record<string, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Líder',
}

export const budgetTypeLabels: Record<string, string> = {
  hourly: 'Por Hora',
  fixed: 'Fixo',
}

export function parseSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) return skills
  if (!skills) return []
  return skills.split(',').map((s) => s.trim()).filter(Boolean)
}

export function formatBudget(budget: number, budgetType: string): string {
  const value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budget)
  return `${value} (${budgetTypeLabels[budgetType] || budgetType})`
}
