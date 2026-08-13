import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  lastName: z.string().optional(),
  email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório.').email('Email inválido.'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório.'),
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  })
  .refine((data) => data.password.length >= 8, {
    message: 'A senha deve ter no mínimo 8 caracteres.',
    path: ['password'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
