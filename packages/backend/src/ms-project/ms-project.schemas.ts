import { z } from 'zod';

export const msProjectStatus = ['not_started', 'on_track', 'at_risk', 'behind', 'completed'] as const;
export const dependencyTypes = ['FS', 'SS', 'FF', 'SF'] as const;
export const resourceTypes = ['work', 'material', 'cost'] as const;
export const msTaskPriority = ['low', 'medium', 'high'] as const;

export const createMsProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  workingDays: z.array(z.number().int().min(0).max(6)).optional(),
});

export const updateMsProjectSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório.').optional(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    workingDays: z.array(z.number().int().min(0).max(6)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const createMsTaskSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  durationDays: z.number().int().min(0).max(3650).optional(),
  milestone: z.boolean().optional(),
  percentComplete: z.number().int().min(0).max(100).optional(),
  priority: z.enum(msTaskPriority, 'Prioridade inválida.').optional(),
  notes: z.string().optional(),
});

export const updateMsTaskSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório.').optional(),
    durationDays: z.number().int().min(0).max(3650).optional(),
    milestone: z.boolean().optional(),
    percentComplete: z.number().int().min(0).max(100).optional(),
    priority: z.enum(msTaskPriority, 'Prioridade inválida.').optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const createMsDependencySchema = z.object({
  taskId: z.number().int().positive(),
  predecessorTaskId: z.number().int().positive(),
  type: z.enum(dependencyTypes, 'Tipo de dependência inválido.').optional(),
  lagDays: z.number().int().optional(),
});

export const createMsResourceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  type: z.enum(resourceTypes, 'Tipo de recurso inválido.').optional(),
  email: z.string().optional(),
  maxUnits: z.number().int().min(1).max(1000).optional(),
});

export const updateMsResourceSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório.').optional(),
    type: z.enum(resourceTypes, 'Tipo de recurso inválido.').optional(),
    email: z.string().optional(),
    maxUnits: z.number().int().min(1).max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const createMsAssignmentSchema = z.object({
  taskId: z.number().int().positive(),
  resourceId: z.number().int().positive(),
  units: z.number().int().min(1).max(1000).optional(),
  work: z.number().int().min(0).optional(),
  actualWork: z.number().int().min(0).optional(),
});

export const updateMsAssignmentSchema = z
  .object({
    units: z.number().int().min(1).max(1000).optional(),
    work: z.number().int().min(0).optional(),
    actualWork: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateMsProjectInput = z.infer<typeof createMsProjectSchema>;
export type UpdateMsProjectInput = z.infer<typeof updateMsProjectSchema>;
export type CreateMsTaskInput = z.infer<typeof createMsTaskSchema>;
export type UpdateMsTaskInput = z.infer<typeof updateMsTaskSchema>;
export type CreateMsDependencyInput = z.infer<typeof createMsDependencySchema>;
export type CreateMsResourceInput = z.infer<typeof createMsResourceSchema>;
export type UpdateMsResourceInput = z.infer<typeof updateMsResourceSchema>;
export type CreateMsAssignmentInput = z.infer<typeof createMsAssignmentSchema>;
export type UpdateMsAssignmentInput = z.infer<typeof updateMsAssignmentSchema>;
