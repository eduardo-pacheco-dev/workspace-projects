import { useState, FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Grid, Link } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { signUpSchema, getFieldErrors } from '../../schemas/authSchemas'
import { formatPhone } from '../../utils/phone'
import { getPasswordStrength } from '../../utils/password'
import AuthTextField from './AuthTextField'
import PasswordField from '../ui/PasswordField'
import PasswordStrength from '../ui/PasswordStrength'
import SubmitButton from '../ui/SubmitButton'
import AuthFooter from './AuthFooter'

export default function SignUpForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const passwordStrength = getPasswordStrength(password)

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = signUpSchema.safeParse({ name, lastName, email, phone, password, confirmPassword })
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name,
        lastName,
        email,
        phone: phone.replace(/\D/g, ''),
        password,
      })
      navigate('/activation-pending')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <AuthTextField
            icon={<PersonOutlinedIcon fontSize="small" />}
            label="Nome"
            value={name}
            onChange={(value) => {
              setName(value)
              clearFieldError('name')
            }}
            required
            error={fieldErrors.name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AuthTextField
            icon={<PersonOutlinedIcon fontSize="small" />}
            label="Sobrenome"
            value={lastName}
            onChange={(value) => {
              setLastName(value)
              clearFieldError('lastName')
            }}
            required
            error={fieldErrors.lastName}
          />
        </Grid>
      </Grid>
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
      <AuthTextField
        icon={<PhoneOutlinedIcon fontSize="small" />}
        label="Telefone"
        value={phone}
        onChange={(value) => {
          setPhone(formatPhone(value))
          clearFieldError('phone')
        }}
        required
        error={fieldErrors.phone}
        placeholder="(11) 99999-9999"
        maxLength={15}
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
      {password && <PasswordStrength strength={passwordStrength} />}
      <PasswordField
        label="Confirmar Senha"
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value)
          clearFieldError('confirmPassword')
        }}
        showPassword={showPassword}
        onToggleShow={() => setShowPassword((prev) => !prev)}
        required
        error={fieldErrors.confirmPassword}
      />
      <SubmitButton fullWidth variant="contained" loading={loading} sx={{ mt: 2, py: 1.4, fontSize: 16 }}>
        Cadastrar
      </SubmitButton>
      <AuthFooter message="Já tem conta?" linkText="Faça login" linkTo="/signin" />
      <Box sx={{ textAlign: 'center', mt: 1 }}>
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
