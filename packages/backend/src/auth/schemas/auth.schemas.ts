import { z } from 'zod';
import { passwordSchema } from '../../common/schemas/password.schema';

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  lastName: z.string().optional(),
  email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
  phone: z.string().optional(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório.'),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
