import { z } from 'zod';

export const taskStatus = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
export const taskPriority = ['low', 'medium', 'high', 'urgent'] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório.'),
  description: z.string().optional(),
  status: z.enum(taskStatus, 'Status inválido.').optional(),
  priority: z.enum(taskPriority, 'Prioridade inválida.').optional(),
  dueAt: z.string().optional(),
  project: z.string().optional(),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
  parentId: z.number().int().positive().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1, 'Título é obrigatório.').optional(),
    description: z.string().optional(),
    status: z.enum(taskStatus, 'Status inválido.').optional(),
    priority: z.enum(taskPriority, 'Prioridade inválida.').optional(),
    dueAt: z.string().optional(),
    project: z.string().optional(),
    client: z.string().optional(),
    assignedTo: z.string().optional(),
    parentId: z.number().int().positive().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
