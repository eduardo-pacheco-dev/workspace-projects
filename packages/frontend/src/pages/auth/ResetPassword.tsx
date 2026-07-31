import { useState, FormEvent } from 'react'
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Link,
  CircularProgress,
} from '@mui/material'
import api from '../../services/api'
import { resetPasswordSchema, getFieldErrors } from '../../schemas/authSchemas'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      navigate('/signin')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao redefinir senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Redefinir Senha
          </Typography>
          {!token && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Token inválido ou ausente.
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nova Senha"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setFieldErrors((prev) => ({ ...prev, password: '' }))
              }}
              margin="normal"
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
            <TextField
              fullWidth
              label="Confirmar Nova Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              margin="normal"
              required
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !token}
              sx={{ mt: 2, mb: 1, py: 1.2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Link component={RouterLink} to="/signin" variant="body2">
              Voltar para o login
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
