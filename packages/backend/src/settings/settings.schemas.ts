import { z } from 'zod';

export const knownSettingKeys = [
  'companyName',
  'companyCnpj',
  'companyEmail',
  'companyPhone',
  'companyAddress',
  'timezone',
  'language',
  'currency',
] as const;

export type KnownSettingKey = (typeof knownSettingKeys)[number];

export const systemSettingsSchema = z.object({
  companyName: z.string().min(1, 'Informe o nome da empresa.').optional(),
  companyCnpj: z.string().optional(),
  companyEmail: z.string().email('Informe um e-mail válido.').optional(),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
});

export const updateSettingsSchema = systemSettingsSchema.refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Informe ao menos uma configuração para atualizar.' },
);

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
