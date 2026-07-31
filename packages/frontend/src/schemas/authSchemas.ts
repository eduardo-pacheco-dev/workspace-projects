import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().min(1, 'Informe seu email.').email('Email inválido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

export const signUpSchema = z
  .object({
    name: z.string().min(1, 'Informe seu nome.'),
    lastName: z.string().min(1, 'Informe seu sobrenome.'),
    email: z.string().min(1, 'Informe seu email.').email('Email inválido.'),
    phone: z.string().min(1, 'Informe seu telefone.'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Informe seu email.').email('Email inválido.'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export function getFieldErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [issue.path[0], issue.message]),
  )
}
