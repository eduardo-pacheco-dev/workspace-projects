import { useState, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
  MenuItem,
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { z } from 'zod'
import api from '../../services/api'
import { formatPhone } from '../../utils/phone'

const baseUserSchema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  lastName: z.string().min(1, 'Informe o sobrenome.'),
  email: z.string().min(1, 'Informe o email.').email('Email inválido.'),
  phone: z.string().min(1, 'Informe o telefone.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  confirmPassword: z.string().min(1, 'Confirme a senha.'),
})

const createSchema = baseUserSchema.refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem.',
  path: ['confirmPassword'],
})

const editSchema = baseUserSchema.partial()

interface UserModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function UserModal({ open, editId, onClose, onSaved }: UserModalProps) {
  const isEdit = Boolean(editId)

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('inactive')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/users/${editId}`)
        .then((res) => {
          const data = res.data
          setName(data.name || '')
          setLastName(data.lastName || '')
          setEmail(data.email || '')
          setPhone(data.phone ? formatPhone(data.phone) : '')
          setStatus(data.status || 'inactive')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const getFieldErrors = (error: z.ZodError) =>
    Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const data = {
      name,
      lastName,
      email,
      phone: phone.replace(/\D/g, ''),
      password: password || undefined,
      confirmPassword: confirmPassword || undefined,
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(data)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = { name, lastName, email, phone: phone.replace(/\D/g, '') }
    if (password) payload.password = password
    if (isEdit) payload.status = status

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/users/${editId}`, payload)
      } else {
        await api.post('/users', payload)
      }
      onSaved()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setFieldErrors({})
    setName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setStatus('inactive')
    setShowPassword(false)
    onClose()
  }

  const passwordHelperText =
    fieldErrors.password || (isEdit && !password ? 'Deixe em branco para manter a senha atual.' : '')

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  clearFieldError('name')
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
                  clearFieldError('lastName')
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
              clearFieldError('email')
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
              clearFieldError('phone')
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
            label={isEdit ? 'Nova Senha' : 'Senha'}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearFieldError('password')
            }}
            margin="normal"
            required={!isEdit}
            error={!!fieldErrors.password}
            helperText={passwordHelperText}
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
          <TextField
            fullWidth
            label="Confirmar Senha"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearFieldError('confirmPassword')
            }}
            margin="normal"
            required={!isEdit}
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
          {isEdit ? (
            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              margin="normal"
            >
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
            </TextField>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Novo usuário entra como <strong>inativo</strong> até ser ativado.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
