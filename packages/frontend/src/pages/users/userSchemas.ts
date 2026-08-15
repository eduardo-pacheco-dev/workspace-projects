import { z } from 'zod'
import { strongPasswordSchema } from '../../schemas/authSchemas'

const baseUserSchema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  lastName: z.string().min(1, 'Informe o sobrenome.'),
  email: z.string().min(1, 'Informe o email.').email('Email inválido.'),
  phone: z.string().min(1, 'Informe o telefone.'),
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Confirme a senha.'),
  role: z.enum(['master', 'admin', 'supervisor', 'coordenador', 'analista', 'technician', 'user']),
  companyId: z.number().nullable(),
})

export const createUserSchema = baseUserSchema
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.role === 'master' || data.companyId != null, {
    message: 'Selecione a empresa do usuário.',
    path: ['companyId'],
  })

export const updateUserSchema = baseUserSchema.partial().refine(
  (data) => data.role === 'master' || data.companyId != null,
  {
    message: 'Selecione a empresa do usuário.',
    path: ['companyId'],
  },
)
