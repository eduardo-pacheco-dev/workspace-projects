import { useState, FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Alert, Box, Link, Typography } from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import api from '../../services/api'
import { forgotPasswordSchema, getFieldErrors } from '../../schemas/authSchemas'
import AuthTextField from './AuthTextField'
import Button from '../ui/Button'
import SubmitButton from '../ui/SubmitButton'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setFieldErrors({})

    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar link.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 21, 68, 0.08)',
          }}
        >
          <MarkEmailReadOutlinedIcon sx={{ fontSize: 36, color: 'rgb(0, 21, 68)' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Email enviado!</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enviamos um link de redefinição para
        </Typography>
        <Box
          sx={{
            display: 'inline-block',
            px: 2,
            py: 0.75,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'rgba(0, 21, 68, 0.06)',
            border: '1px solid rgba(0, 21, 68, 0.12)',
            color: 'rgb(0, 21, 68)',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {email}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
        </Typography>
        <Button
          to="/signin"
          fullWidth
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{ py: 1.4, fontSize: 16 }}
        >
          Voltar para o login
        </Button>
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <AuthTextField
        icon={<EmailOutlinedIcon fontSize="small" />}
        label="Email"
        type="email"
        value={email}
        onChange={(value) => {
          setEmail(value)
          setFieldErrors((prev) => ({ ...prev, email: '' }))
        }}
        required
        error={fieldErrors.email}
      />
      <SubmitButton fullWidth variant="contained" loading={loading} sx={{ mt: 2, py: 1.4, fontSize: 16 }}>
        Enviar link de recuperação
      </SubmitButton>
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Link
          component={RouterLink}
          to="/signin"
          variant="body2"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          <ArrowBackIcon fontSize="small" />
          Voltar para o login
        </Link>
      </Box>
    </Box>
  )
}
