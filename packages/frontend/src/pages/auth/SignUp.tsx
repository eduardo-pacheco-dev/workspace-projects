import { useState, FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  Avatar,
  Grid,
  LinearProgress,
} from '@mui/material'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { signUpSchema, getFieldErrors } from '../../schemas/authSchemas'
import { formatPhone } from '../../utils/phone'
import { getPasswordStrength, getStrengthColor } from '../../utils/password'

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = signUpSchema.safeParse({
      name,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    })
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: 'background.default',
      }}
    >
      {/* Left panel - branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          background: 'linear-gradient(135deg, #1976d2 0%, #115293 50%, #0d47a1 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          AFL Engenharia
        </Typography>

        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Crie sua conta e comece a trabalhar
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 480 }}>
            Junte-se à nossa plataforma e gerencie seus projetos com facilidade.
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} AFL Engenharia. Todos os direitos reservados.
        </Typography>
      </Box>

      {/* Right panel - form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52, mb: 2 }}>
                <PersonAddOutlinedIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Criar conta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preencha os dados abaixo para se cadastrar
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, name: '' }))
                    }}
                    margin="normal"
                    required
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sobrenome"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, lastName: '' }))
                    }}
                    margin="normal"
                    required
                    error={!!fieldErrors.lastName}
                    helperText={fieldErrors.lastName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, email: '' }))
                }}
                margin="normal"
                required
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Telefone"
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value))
                  setFieldErrors((prev) => ({ ...prev, phone: '' }))
                }}
                margin="normal"
                required
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
                placeholder="(11) 99999-9999"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, password: '' }))
                }}
                margin="normal"
                required
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {password && (
                <Box sx={{ mt: 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Nível de segurança
                    </Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: getStrengthColor(passwordStrength.score) }}>
                      {passwordStrength.label}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength.score}
                    color={getStrengthColor(passwordStrength.score).replace('.main', '') as any}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Box component="ul" sx={{ m: 0, mt: 1, p: 0, listStyle: 'none' }}>
                    {passwordStrength.criteria.map((criterion) => (
                      <Box
                        component="li"
                        key={criterion.label}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          py: 0.25,
                          color: criterion.met ? 'success.main' : 'text.disabled',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: 14 }}>
                          {criterion.met ? '✓' : '•'}
                        </Typography>
                        <Typography variant="caption" sx={{ textDecoration: criterion.met ? 'line-through' : 'none' }}>
                          {criterion.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              <TextField
                fullWidth
                label="Confirmar Senha"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
                }}
                margin="normal"
                required
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 2, py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: 16 }}
              >
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
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
