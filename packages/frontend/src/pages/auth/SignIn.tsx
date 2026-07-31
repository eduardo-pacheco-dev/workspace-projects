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
  Checkbox,
  FormControlLabel,
  Paper,
  Avatar,
  Divider,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import GoogleIcon from '@mui/icons-material/Google'
import { useAuth } from '../../contexts/AuthContext'
import { signInSchema, getFieldErrors } from '../../schemas/authSchemas'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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
      setError(err.response?.data?.message || 'Erro ao fazer login.')
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
            Gerencie seu workspace em um só lugar
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 480 }}>
            Freelancers, jobs, propostas e contratos organizados em um único painel.
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Workspace. Todos os direitos reservados.
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
                <LockOutlinedIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Bem-vindo de volta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entre com suas credenciais
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <FormControlLabel control={<Checkbox size="small" />} label="Lembrar de mim" />
                <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                  Esqueceu a senha?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 2, py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: 16 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                ou
              </Typography>
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
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
