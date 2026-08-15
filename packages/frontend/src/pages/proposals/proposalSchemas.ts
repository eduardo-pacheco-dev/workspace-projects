import { z } from 'zod'

export const proposalSchema = z.object({
  jobId: z.preprocess((value) => Number(value), z.number().min(1, 'Informe o ID do job.')),
  freelancerId: z.preprocess((value) => Number(value), z.number().min(1, 'Informe o ID do freelancer.')),
  coverLetter: z.string().optional(),
  proposedRate: z.preprocess((value) => Number(value), z.number().min(0, 'Informe a taxa proposta.')),
  estimatedDuration: z.string().optional(),
})
