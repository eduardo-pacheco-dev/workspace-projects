import { z } from 'zod';

export const serviceOrderStatus = ['aberta', 'em_andamento', 'concluida', 'cancelada'] as const;
export const operadoraOptions = ['TIM', 'CLARO', 'VIVO', 'Outras'] as const;

export const createServiceOrderSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório.'),
  descricao: z.string().optional(),
  siteId: z.string().optional(),
  endId: z.string().optional(),
  operadora: z.enum(operadoraOptions, 'Operadora inválida.').optional(),
  endereco: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  status: z.enum(serviceOrderStatus, 'Status inválido.').optional(),
  observacoes: z.string().optional(),
});

export const updateServiceOrderSchema = z
  .object({
    cliente: z.string().min(1, 'Cliente é obrigatório.').optional(),
    descricao: z.string().optional(),
    siteId: z.string().optional(),
    endId: z.string().optional(),
    operadora: z.enum(operadoraOptions, 'Operadora inválida.').optional(),
    endereco: z.string().optional(),
    dataInicio: z.string().optional(),
    dataFim: z.string().optional(),
    status: z.enum(serviceOrderStatus, 'Status inválido.').optional(),
    observacoes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
export type UpdateServiceOrderInput = z.infer<typeof updateServiceOrderSchema>;
