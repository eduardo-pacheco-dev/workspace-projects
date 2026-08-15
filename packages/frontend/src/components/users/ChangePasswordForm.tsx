import { useState } from 'react'
import { Alert, Box, Button, Grid, Typography } from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors, strongPasswordSchema } from '../../schemas/authSchemas'
import { getPasswordStrength } from '../../utils/password'
import PasswordField from '../ui/PasswordField'
import PasswordStrength from '../ui/PasswordStrength'

interface ChangePasswordFormProps {
  userId: number | string
}

const passwordSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export default function ChangePasswordForm({ userId }: ChangePasswordFormProps) {
  const { showToast } = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passError, setPassError] = useState<Record<string, string>>({})
  const [passSaved, setPassSaved] = useState(false)
  const [passSaving, setPassSaving] = useState(false)
  const passwordStrength = getPasswordStrength(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassError({})
    setPassSaved(false)

    const result = passwordSchema.safeParse({ newPassword, confirmPassword })
    if (!result.success) {
      setPassError(getFieldErrors(result.error))
      return
    }

    setPassSaving(true)
    try {
      await api.patch(`/users/${userId}`, { password: newPassword })
      setPassSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      showToast('Senha alterada com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível alterar a senha.', 'error')
    } finally {
      setPassSaving(false)
    }
  }

  const toggleShowPassword = () => setShowPassword((prev) => !prev)

  return (
    <>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Alterar Senha
      </Typography>
      {passSaved && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPassSaved(false)}>
          Senha alterada com sucesso.
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <PasswordField
              label="Nova Senha"
              value={newPassword}
              onChange={(value) => {
                setNewPassword(value)
                setPassError((prev) => ({ ...prev, newPassword: '' }))
              }}
              showPassword={showPassword}
              onToggleShow={toggleShowPassword}
              error={passError.newPassword}
              helperText={passError.newPassword || (newPassword ? '' : 'No mínimo 8 caracteres.')}
            />
            {newPassword && <PasswordStrength strength={passwordStrength} />}
          </Grid>
          <Grid item xs={12} sm={6}>
            <PasswordField
              label="Confirmar Nova Senha"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value)
                setPassError((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              showPassword={showPassword}
              onToggleShow={toggleShowPassword}
              error={passError.confirmPassword}
              helperText={passError.confirmPassword}
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" size="large" disabled={passSaving} sx={{ mt: 2 }}>
          {passSaving ? 'Salvando...' : 'Alterar Senha'}
        </Button>
      </Box>
    </>
  )
}
