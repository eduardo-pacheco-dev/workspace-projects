import { z } from 'zod'

export const jobSchema = z.object({
  title: z.string().min(1, 'Informe o título.'),
  description: z.string().optional(),
  budget: z.preprocess((value) => Number(value), z.number().min(0, 'Informe o orçamento.')),
  budgetType: z.string().optional(),
  skills: z.string().optional(),
  experienceLevel: z.string().optional(),
  status: z.string().optional(),
  clientId: z.string().optional(),
})
