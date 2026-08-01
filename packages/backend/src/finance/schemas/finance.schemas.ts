import { z } from 'zod';

export const financeEntryTypes = ['income', 'expense', 'transfer'] as const;
export const financeEntryStatus = ['pending', 'paid', 'canceled'] as const;

export const createFinanceEntrySchema = z.object({
  type: z.enum(financeEntryTypes, 'Invalid type.'),
  description: z.string().min(1, 'Description is required.'),
  category: z.string().min(1, 'Category is required.'),
  amount: z.number().positive('Amount must be greater than zero.'),
  date: z.string().min(1, 'Date is required.'),
  paymentMethod: z.string().optional(),
  status: z.enum(financeEntryStatus, 'Invalid status.').optional(),
  notes: z.string().optional(),
});

export const updateFinanceEntrySchema = z
  .object({
    type: z.enum(financeEntryTypes, 'Invalid type.').optional(),
    description: z.string().min(1, 'Description is required.').optional(),
    category: z.string().min(1, 'Category is required.').optional(),
    amount: z.number().positive('Amount must be greater than zero.').optional(),
    date: z.string().min(1, 'Date is required.').optional(),
    paymentMethod: z.string().optional(),
    status: z.enum(financeEntryStatus, 'Invalid status.').optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const createSpendingLimitSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  month: z
    .number()
    .int('Invalid month.')
    .min(1, 'Invalid month.')
    .max(12, 'Invalid month.'),
  year: z
    .number()
    .int('Invalid year.')
    .min(2000, 'Invalid year.')
    .max(2100, 'Invalid year.'),
  amount: z.number().positive('Amount must be greater than zero.'),
});

export const updateSpendingLimitSchema = z
  .object({
    category: z.string().min(1, 'Category is required.').optional(),
    month: z
      .number()
      .int('Invalid month.')
      .min(1, 'Invalid month.')
      .max(12, 'Invalid month.')
      .optional(),
    year: z
      .number()
      .int('Invalid year.')
      .min(2000, 'Invalid year.')
      .max(2100, 'Invalid year.')
      .optional(),
    amount: z.number().positive('Amount must be greater than zero.').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export type CreateFinanceEntryInput = z.infer<typeof createFinanceEntrySchema>;
export type UpdateFinanceEntryInput = z.infer<typeof updateFinanceEntrySchema>;
export type CreateSpendingLimitInput = z.infer<typeof createSpendingLimitSchema>;
export type UpdateSpendingLimitInput = z.infer<typeof updateSpendingLimitSchema>;
