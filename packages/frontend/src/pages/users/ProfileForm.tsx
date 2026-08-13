import { useState, useEffect } from 'react'
import {
  Paper,
  Box,
  Avatar,
  Grid,
  Divider,
  TextField,
  Button,
  Alert,
  Chip,
  Typography,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { z } from 'zod'
import { formatDateTime } from '../../utils/format'
import { formatPhone } from '../../utils/phone'
import { getPasswordStrength, getStrengthColor } from '../../utils/password'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import ConfirmDialog from '../../components/ConfirmDialog'

interface UserProfile {
  id: number
  name: string
  lastName: string | null
  email: string
  phone: string | null
  status: string
  createdAt: string
}

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export default function ProfileForm() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const [data, setData] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passError, setPassError] = useState<Record<string, string>>({})
  const [passSaved, setPassSaved] = useState(false)
  const [passSaving, setPassSaving] = useState(false)
  const passwordStrength = getPasswordStrength(newPassword)

  useEffect(() => {
    if (!user?.id) return
    api.get(`/users/${user.id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Não foi possível carregar o perfil.'))
  }, [user?.id])

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const fullName = data
    ? `${data.name}${data.lastName ? ` ${data.lastName}` : ''}`
    : user?.name || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data || !user?.id) return
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      const payload: any = { name: data.name }
      if (data.lastName) payload.lastName = data.lastName
      if (data.phone) payload.phone = data.phone
      await api.patch(`/users/${user.id}`, payload)
      localStorage.setItem('user', JSON.stringify({ ...user, name: fullName }))
      setSaved(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassError({})
    setPassSaved(false)

    const result = passwordSchema.safeParse({ newPassword, confirmPassword })
    if (!result.success) {
      setPassError(getFieldErrors(result.error))
      return
    }

    if (!user?.id) return
    setPassSaving(true)
    try {
      await api.patch(`/users/${user.id}`, { password: newPassword })
      setPassSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      showToast('Senha alterada com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível alterar a senha.', 'error')
    } finally {
      setPassSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) return
    setDeleting(true)
    try {
      await api.delete(`/users/${user.id}`)
      showToast('Conta excluída com sucesso.')
      logout()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir a conta. Tente novamente.', 'error')
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 26 }}>
          {initials}
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{fullName}</Typography>
          <Typography variant="body2" color="text.secondary">{data?.email}</Typography>
          {data && (
            <Chip
              size="small"
              sx={{ mt: 0.5 }}
              label={data.status === 'active' ? 'Ativo' : 'Inativo'}
              color={data.status === 'active' ? 'success' : 'default'}
            />
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Perfil atualizado com sucesso.</Alert>}

      {data && (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Informações Pessoais
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sobrenome"
                value={data.lastName || ''}
                onChange={(e) => setData({ ...data, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" value={data.email} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefone"
                value={formatPhone(data.phone || '')}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Conta criada em {formatDateTime(data.createdAt)}
          </Typography>
          <Button type="submit" variant="contained" size="large" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Alterar Senha
      </Typography>
      {passSaved && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPassSaved(false)}>
          Senha alterada com sucesso.
        </Alert>
      )}
      <Box component="form" onSubmit={handleChangePassword}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nova Senha"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setPassError((prev) => ({ ...prev, newPassword: '' }))
              }}
              error={!!passError.newPassword}
              helperText={passError.newPassword || (newPassword ? '' : 'No mínimo 8 caracteres.')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {newPassword && (
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirmar Nova Senha"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setPassError((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              error={!!passError.confirmPassword}
              helperText={passError.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" size="large" disabled={passSaving} sx={{ mt: 2 }}>
          {passSaving ? 'Salvando...' : 'Alterar Senha'}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle2" color="error" sx={{ mb: 1, fontWeight: 600 }}>
        Zona de Perigo
      </Typography>
      <Alert severity="error" sx={{ mb: 2 }}>
        A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão removidos.
      </Alert>
      <Button color="error" variant="outlined" onClick={() => setDeleteOpen(true)} disabled={deleting}>
        {deleting ? 'Excluindo...' : 'Excluir conta'}
      </Button>

      <ConfirmDialog
        open={deleteOpen}
        title="Excluir conta"
        message="Tem certeza que deseja excluir sua conta? Essa ação é permanente e não pode ser desfeita."
        confirmLabel="Excluir conta"
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteOpen(false)}
      />
    </Paper>
  )
}
