import { z } from 'zod'

export const contractSchema = z.object({
  proposalId: z.preprocess(
    (value) => (value === '' || value == null ? undefined : Number(value)),
    z.number().optional(),
  ),
  jobId: z.preprocess((value) => Number(value), z.number().min(1, 'Informe o ID do job.')),
  freelancerId: z.preprocess((value) => Number(value), z.number().min(1, 'Informe o ID do freelancer.')),
  clientId: z.preprocess((value) => Number(value), z.number().min(1, 'Informe o ID do cliente.')),
  startDate: z.string().min(1, 'Informe a data de início.'),
  endDate: z.string().optional(),
  totalBudget: z.preprocess((value) => Number(value), z.number().min(0, 'Informe o orçamento total.')),
})
