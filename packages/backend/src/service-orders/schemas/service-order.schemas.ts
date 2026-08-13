import { z } from 'zod';
import { OPERADORA_OPTIONS, SERVICE_ORDER_STATUSES } from '../domain/service-order-rules';

export const serviceOrderStatus = SERVICE_ORDER_STATUSES;
export const operadoraOptions = OPERADORA_OPTIONS;

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
