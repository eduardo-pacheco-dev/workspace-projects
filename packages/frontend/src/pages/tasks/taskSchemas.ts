import { z } from 'zod'

const baseSchema = z.object({
  title: z.string().min(1, 'Informe o título.'),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueAt: z.string().optional(),
  project: z.string().optional(),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
})

export const createTaskSchema = baseSchema
export const updateTaskSchema = baseSchema.partial()
