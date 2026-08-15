import { useState, FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, Link } from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { useAuth } from '../../contexts/AuthContext'
import { signInSchema, getFieldErrors } from '../../schemas/authSchemas'
import AuthTextField from './AuthTextField'
import PasswordField from '../ui/PasswordField'

export default function SignInForm() {
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
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
  )
}
