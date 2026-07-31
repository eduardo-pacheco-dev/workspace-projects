import { useState, FormEvent } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  Paper,
  Avatar,
} from '@mui/material'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import api from '../../services/api'
import { forgotPasswordSchema, getFieldErrors } from '../../schemas/authSchemas'

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
            Recupere o acesso à sua conta
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 480 }}>
            Enviaremos um link de redefinição para o seu email.
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
                <LockResetOutlinedIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Recuperar Senha
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Informe seu email para receber o link de redefinição
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {success ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <MarkEmailReadOutlinedIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Email enviado!
                </Typography>
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
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
