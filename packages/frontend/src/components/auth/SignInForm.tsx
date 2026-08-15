import { useState, FormEvent, useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Checkbox, FormControlLabel, Link } from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { useAuth } from '../../contexts/AuthContext'
import { signInSchema, getFieldErrors } from '../../schemas/authSchemas'
import AuthTextField from './AuthTextField'
import PasswordField from '../ui/PasswordField'
import SubmitButton from '../ui/SubmitButton'

const REMEMBERED_EMAIL_KEY = 'rememberedEmail'

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (remembered) {
      setEmail(remembered)
      setRememberMe(true)
    }
  }, [])

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const rememberEmail = () => {
    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY)
    }
  }

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
      rememberEmail()
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
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              sx={{ color: 'rgb(0, 21, 68)', '&.Mui-checked': { color: 'rgb(0, 21, 68)' } }}
            />
          }
          label="Lembrar de mim"
          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem', color: 'text.secondary' } }}
        />
        <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
          Esqueceu a senha?
        </Link>
      </Box>

      <SubmitButton fullWidth variant="contained" loading={loading} sx={{ mt: 2, py: 1.4, fontSize: 16 }}>
        Entrar
      </SubmitButton>
    </Box>
  )
}
