import { useState, FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Link, Typography } from '@mui/material'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import api from '../../services/api'
import { forgotPasswordSchema, getFieldErrors } from '../../schemas/authSchemas'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthTextField from '../../components/auth/AuthTextField'

export default function ForgotPassword() {
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

  return (
    <AuthLayout
      headline="Recupere o acesso à sua conta"
      headlineSubtitle="Enviaremos um link de redefinição para o seu email."
      icon={<LockResetOutlinedIcon />}
      title="Recuperar Senha"
      subtitle="Informe seu email para receber o link de redefinição"
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {success ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <MarkEmailReadOutlinedIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
          <Typography variant="h6" gutterBottom>Email enviado!</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </Typography>
          <Button
            component={RouterLink}
            to="/signin"
            fullWidth
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{ py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: 16 }}
          >
            Voltar para o login
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2, py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: 16 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar link de recuperação'}
          </Button>
        </Box>
      )}

      {!success && (
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
      )}
    </AuthLayout>
  )
}
