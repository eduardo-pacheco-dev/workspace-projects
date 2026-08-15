import { useState, FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Grid, Link, Typography } from '@mui/material'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { signUpSchema, getFieldErrors } from '../../schemas/authSchemas'
import { formatPhone } from '../../utils/phone'
import { getPasswordStrength } from '../../utils/password'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthTextField from '../../components/auth/AuthTextField'
import PasswordField from '../../components/ui/PasswordField'
import PasswordStrength from '../../components/ui/PasswordStrength'

export default function SignUp() {
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
    <AuthLayout
      headline="Crie sua conta e comece a trabalhar"
      headlineSubtitle="Junte-se à nossa plataforma e gerencie seus projetos com facilidade."
      icon={<PersonAddOutlinedIcon />}
      title="Criar conta"
      subtitle="Preencha os dados abaixo para se cadastrar"
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
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
        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2, py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: 16 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar'}
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Já tem conta?{' '}
          <Link component={RouterLink} to="/signin" variant="body2" underline="hover" fontWeight={600}>
            Faça login
          </Link>
        </Typography>
        <Link
          component={RouterLink}
          to="/signin"
          variant="body2"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1 }}
        >
          <ArrowBackIcon fontSize="small" />
          Voltar para o login
        </Link>
      </Box>
    </AuthLayout>
  )
}
