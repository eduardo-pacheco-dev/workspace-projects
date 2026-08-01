import { z } from 'zod';

export const financeEntryTypes = ['income', 'expense', 'transfer'] as const;
export const financeEntryStatus = ['pending', 'paid', 'canceled'] as const;
export const financeEntryRecurrence = ['once', 'daily', 'weekly', 'monthly', 'yearly'] as const;

export const createFinanceEntrySchema = z.object({
  type: z.enum(financeEntryTypes, 'Tipo inválido.'),
  description: z.string().min(1, 'Informe uma descrição.'),
  category: z.string().min(1, 'Informe uma categoria.'),
  amount: z.number().positive('O valor deve ser maior que zero.'),
  date: z.string().min(1, 'Informe uma data.'),
  paymentMethod: z.string().optional(),
  status: z.enum(financeEntryStatus, 'Status inválido.').optional(),
  notes: z.string().optional(),
  accountId: z.number().int('Conta inválida.').nullable().optional(),
  recurrence: z.enum(financeEntryRecurrence, 'Repetição inválida.').optional(),
  recurrenceEnd: z.string().optional(),
  tags: z.string().optional(),
});

export const updateFinanceEntrySchema = z
  .object({
    type: z.enum(financeEntryTypes, 'Tipo inválido.').optional(),
    description: z.string().min(1, 'Informe uma descrição.').optional(),
    category: z.string().min(1, 'Informe uma categoria.').optional(),
    amount: z.number().positive('O valor deve ser maior que zero.').optional(),
    date: z.string().min(1, 'Informe uma data.').optional(),
    paymentMethod: z.string().optional(),
    status: z.enum(financeEntryStatus, 'Status inválido.').optional(),
    notes: z.string().optional(),
    accountId: z.number().int('Conta inválida.').nullable().optional(),
    recurrence: z.enum(financeEntryRecurrence, 'Repetição inválida.').optional(),
    recurrenceEnd: z.string().optional(),
    tags: z.string().optional(),
    attachment: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const createSpendingLimitSchema = z.object({
  category: z.string().min(1, 'Informe uma categoria.'),
  month: z
    .number()
    .int('Mês inválido.')
    .min(1, 'Mês inválido.')
    .max(12, 'Mês inválido.'),
  year: z
    .number()
    .int('Ano inválido.')
    .min(2000, 'Ano inválido.')
    .max(2100, 'Ano inválido.'),
  amount: z.number().positive('O valor deve ser maior que zero.'),
});

export const updateSpendingLimitSchema = z
  .object({
    category: z.string().min(1, 'Informe uma categoria.').optional(),
    month: z
      .number()
      .int('Mês inválido.')
      .min(1, 'Mês inválido.')
      .max(12, 'Mês inválido.')
      .optional(),
    year: z
      .number()
      .int('Ano inválido.')
      .min(2000, 'Ano inválido.')
      .max(2100, 'Ano inválido.')
      .optional(),
    amount: z.number().positive('O valor deve ser maior que zero.').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const createBankAccountSchema = z.object({
  name: z.string().min(1, 'Informe um nome.'),
  bank: z.string().optional(),
  balance: z.number('Informe um saldo válido.'),
});

export const updateBankAccountSchema = z
  .object({
    name: z.string().min(1, 'Informe um nome.').optional(),
    bank: z.string().optional(),
    balance: z.number('Informe um saldo válido.').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Informe um nome.'),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1, 'Informe um nome.').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export type CreateFinanceEntryInput = z.infer<typeof createFinanceEntrySchema>;
export type UpdateFinanceEntryInput = z.infer<typeof updateFinanceEntrySchema>;
export type CreateSpendingLimitInput = z.infer<typeof createSpendingLimitSchema>;
export type UpdateSpendingLimitInput = z.infer<typeof updateSpendingLimitSchema>;
export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
