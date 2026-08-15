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
  MenuItem,
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { formatPhone } from '../../utils/phone'
import { roleOptions, RoleType } from '../settings/roleModules'
import { createUserSchema, updateUserSchema } from './userSchemas'
import PasswordField from '../../components/users/PasswordField'

interface UserModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function UserModal({ open, editId, onClose, onSaved }: UserModalProps) {
  const isEdit = Boolean(editId)
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('inactive')
  const [role, setRole] = useState<RoleType>('user')
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [companies, setCompanies] = useState<{ id: number; nome: string }[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const isMasterUser = currentUser?.role === 'master'
  const showMasterOption = isMasterUser || role === 'master'
  const isSelf = isEdit && currentUser != null && String(editId) === String(currentUser.id)
  const availableCompanies = isMasterUser
    ? companies
    : currentUser?.companyId != null
      ? [{ id: currentUser.companyId, nome: currentUser.companyName || '' }]
      : []

  useEffect(() => {
    if (!open) return
    if (isMasterUser) {
      api
        .get('/companies', { params: { limit: 100, sortBy: 'nome', sortOrder: 'ASC' } })
        .then((res) => {
          const d = res.data
          setCompanies(Array.isArray(d) ? d : d.data ?? [])
        })
        .catch(() => {})
    } else if (currentUser?.companyId != null) {
      setCompanies([{ id: currentUser.companyId, nome: currentUser.companyName || '' }])
      if (!isEdit) setCompanyId(currentUser.companyId)
    }
  }, [open, isMasterUser, isEdit, currentUser?.companyId, currentUser?.companyName])

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
          setRole((data.role as RoleType) || 'user')
          setCompanyId(data.companyId ?? null)
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const buildPayload = () => {
    const payload: any = { name, lastName, email, phone: phone.replace(/\D/g, ''), role }
    payload.companyId = role === 'master' ? null : companyId
    if (password) payload.password = password
    if (isEdit) payload.status = status
    return payload
  }

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
      role,
      companyId: role === 'master' ? null : companyId,
    }

    const schema = isEdit ? updateUserSchema : createUserSchema
    const result = schema.safeParse(data)
    if (!result.success) {
      setFieldErrors(
        Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message])),
      )
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/users/${editId}`, buildPayload())
      } else {
        await api.post('/users', buildPayload())
      }
      onSaved()
      handleClose()
      showToast(isEdit ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.')
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
    setRole('user')
    setCompanyId(null)
    setShowPassword(false)
    onClose()
  }

  const toggleShowPassword = () => setShowPassword((prev) => !prev)

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
          {!isEdit && (
            <>
              <PasswordField
                label="Senha"
                value={password}
                onChange={(value) => {
                  setPassword(value)
                  clearFieldError('password')
                }}
                showPassword={showPassword}
                onToggleShow={toggleShowPassword}
                required
                error={fieldErrors.password}
              />
              <PasswordField
                label="Confirmar Senha"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value)
                  clearFieldError('confirmPassword')
                }}
                showPassword={showPassword}
                onToggleShow={toggleShowPassword}
                required
                error={fieldErrors.confirmPassword}
              />
            </>
          )}
          <TextField
            fullWidth
            select
            label="Perfil"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as RoleType)
              clearFieldError('role')
            }}
            margin="normal"
            disabled={isEdit && role === 'master'}
            helperText={
              fieldErrors.role ||
              (isEdit && role === 'master'
                ? 'O perfil master não pode ser alterado para usuário.'
                : isEdit && !showMasterOption
                  ? 'Perfil master é exclusivo do administrador geral.'
                  : undefined)
            }
            error={!!fieldErrors.role}
          >
            {roleOptions
              .filter((o) => o.value !== 'master' || showMasterOption)
              .map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
          </TextField>
          {role !== 'master' && (
            <TextField
              fullWidth
              select
              label="Empresa"
              value={companyId ?? ''}
              onChange={(e) => {
                setCompanyId(e.target.value ? Number(e.target.value) : null)
                clearFieldError('companyId')
              }}
              margin="normal"
              required
              disabled={!isMasterUser}
              error={!!fieldErrors.companyId}
              helperText={
                fieldErrors.companyId ||
                (!isMasterUser ? 'Usuário não-master só pode criar usuários para a própria empresa.' : 'Usuário não-master deve estar vinculado a uma empresa.')
              }
            >
              {availableCompanies.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
              ))}
            </TextField>
          )}
          {isEdit ? (
            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              margin="normal"
              disabled={isEdit && (role === 'master' || isSelf)}
              helperText={
                isEdit && role === 'master'
                  ? 'O administrador master não pode ser desativado.'
                  : isEdit && isSelf
                    ? 'Não é possível desativar o próprio usuário.'
                    : undefined
              }
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
