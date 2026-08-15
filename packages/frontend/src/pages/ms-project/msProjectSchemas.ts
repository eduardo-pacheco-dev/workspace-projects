import { z } from 'zod'

export const planSchema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  workingDays: z.array(z.number()).min(1, 'Selecione ao menos um dia útil.'),
})

export const taskSchema = z.object({
  name: z.string().min(1, 'Informe o nome da tarefa.'),
  durationDays: z.string().optional(),
  milestone: z.boolean().optional(),
  percentComplete: z.string().optional(),
  priority: z.string().optional(),
  notes: z.string().optional(),
  predecessorId: z.string().optional(),
  depType: z.string().optional(),
  lagDays: z.string().optional(),
})

export const resourceSchema = z.object({
  name: z.string().min(1, 'Informe o nome do recurso.'),
  type: z.string().optional(),
  email: z.string().optional(),
  maxUnits: z.string().optional(),
  taskId: z.string().optional(),
  units: z.string().optional(),
  work: z.string().optional(),
})
