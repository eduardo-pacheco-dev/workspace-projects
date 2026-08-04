import { z } from 'zod';

export const scheduleEventStatus = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

export const createScheduleEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório.'),
  description: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  location: z.string().optional(),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.enum(scheduleEventStatus, 'Status inválido.').optional(),
});

export const updateScheduleEventSchema = z
  .object({
    title: z.string().min(1, 'Título é obrigatório.').optional(),
    description: z.string().optional(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    location: z.string().optional(),
    client: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.enum(scheduleEventStatus, 'Status inválido.').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateScheduleEventInput = z.infer<typeof createScheduleEventSchema>;
export type UpdateScheduleEventInput = z.infer<typeof updateScheduleEventSchema>;
