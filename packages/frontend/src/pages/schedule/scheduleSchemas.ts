import { z } from 'zod'

const baseSchema = z.object({
  title: z.string().min(1, 'Informe o título.'),
  description: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  location: z.string().optional(),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
})

export const createScheduleSchema = baseSchema
export const updateScheduleSchema = baseSchema.partial()
