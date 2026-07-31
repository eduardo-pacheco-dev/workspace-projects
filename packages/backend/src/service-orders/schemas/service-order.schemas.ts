import { z } from 'zod';

export const serviceOrderStatus = ['aberta', 'em_andamento', 'concluida', 'cancelada'] as const;

export const createServiceOrderSchema = z.object({
  numero: z.string().min(1, 'Número é obrigatório.'),
  cliente: z.string().min(1, 'Cliente é obrigatório.'),
  descricao: z.string().min(1, 'Descrição é obrigatória.'),
  endereco: z.string().optional(),
  data: z.string().optional(),
  valor: z.number().min(0, 'Valor deve ser maior ou igual a zero.').optional(),
  status: z.enum(serviceOrderStatus, 'Status inválido.').optional(),
  observacoes: z.string().optional(),
});

export const updateServiceOrderSchema = z
  .object({
    numero: z.string().min(1, 'Número é obrigatório.').optional(),
    cliente: z.string().min(1, 'Cliente é obrigatório.').optional(),
    descricao: z.string().min(1, 'Descrição é obrigatória.').optional(),
    endereco: z.string().optional(),
    data: z.string().optional(),
    valor: z.number().min(0, 'Valor deve ser maior ou igual a zero.').optional(),
    status: z.enum(serviceOrderStatus, 'Status inválido.').optional(),
    observacoes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
export type UpdateServiceOrderInput = z.infer<typeof updateServiceOrderSchema>;
