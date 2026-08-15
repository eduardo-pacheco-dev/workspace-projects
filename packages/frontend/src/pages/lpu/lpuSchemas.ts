import { z } from 'zod'

export const lpuSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  descricao: z.string().optional(),
  valor: z.preprocess(
    (value) => (value === '' || value == null ? undefined : Number(value)),
    z.number().optional(),
  ),
  data: z.string().optional(),
  status: z.string().optional(),
})
