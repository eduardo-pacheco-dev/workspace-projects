import { z } from 'zod'

export const jobSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  tipo: z.string().min(1, 'Informe o tipo da rotina.'),
  cronExpression: z.string().min(1, 'Informe a expressão cron.'),
  descricao: z.string().optional(),
  status: z.string().optional(),
})