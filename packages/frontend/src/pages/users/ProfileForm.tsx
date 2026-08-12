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
} from '@mui/material'
import { formatDateTime } from '../../utils/format'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

interface UserProfile {
  id: number
  name: string
  lastName: string | null
  email: string
  phone: string | null
  status: string
  createdAt: string
}

export default function ProfileForm() {
  const { user } = useAuth()
  const [data, setData] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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
                value={data.phone || ''}
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
    </Paper>
  )
}
