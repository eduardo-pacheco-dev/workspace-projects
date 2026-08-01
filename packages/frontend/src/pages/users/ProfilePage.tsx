import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Grid,
  Divider,
  TextField,
  Button,
  Alert,
} from '@mui/material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [data, setData] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    api.get(`/users/${user.id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Não foi possível carregar o perfil.'))
  }, [user?.id])

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data || !user?.id) return
    setError('')
    setSaved(false)
    try {
      await api.patch(`/users/${user.id}`, { name: data.name })
      localStorage.setItem('user', JSON.stringify({ ...user, name: data.name }))
      setSaved(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar.')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Meu Perfil</Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie suas informações pessoais
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {saved && <Alert severity="success" sx={{ mb: 2 }}>Perfil atualizado com sucesso.</Alert>}

        {data && (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" value={data.email} disabled />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Button type="submit" variant="contained" size="large">
              Salvar Alterações
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
