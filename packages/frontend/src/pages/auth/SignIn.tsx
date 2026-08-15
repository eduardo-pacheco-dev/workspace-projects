import { useState, FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Checkbox, CircularProgress, Divider, FormControlLabel, Link, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import GoogleIcon from '@mui/icons-material/Google'
import { useAuth } from '../../contexts/AuthContext'
import { signInSchema, getFieldErrors } from '../../schemas/authSchemas'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthTextField from '../../components/auth/AuthTextField'
import PasswordField from '../../components/ui/PasswordField'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = signInSchema.safeParse({ email, password })
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      if (err.response?.data?.code === 'ACCOUNT_INACTIVE') {
        navigate('/activation-pending')
        return
      }
      setError(err.response?.data?.message || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      headline="Gerencie seu workspace em um só lugar"
      headlineSubtitle="Freelancers, jobs, propostas e contratos organizados em um único painel."
      icon={<LockOutlinedIcon />}
      title="Bem-vindo de volta"
      subtitle="Entre com suas credenciais"
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <AuthTextField
          icon={<EmailOutlinedIcon fontSize="small" />}
          label="Email"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value)
            clearFieldError('email')
          }}
          required
          error={fieldErrors.email}
        />
        <PasswordField
          label="Senha"
          value={password}
          onChange={(value) => {
            setPassword(value)
            clearFieldError('password')
          }}
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          required
          error={fieldErrors.password}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <FormControlLabel control={<Checkbox size="small" />} label="Lembrar de mim" />
          <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
            Esqueceu a senha?
          </Link>
        </Box>

        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2, py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: 16 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">ou</Typography>
      </Divider>

      <Button
        component={RouterLink}
        to="/auth/google"
        fullWidth
        variant="outlined"
        color="inherit"
        startIcon={<GoogleIcon />}
        sx={{ py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: 16 }}
      >
        Continuar com Google
      </Button>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Não tem conta?{' '}
          <Link component={RouterLink} to="/signup" variant="body2" underline="hover" fontWeight={600}>
            Cadastre-se
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  )
}
