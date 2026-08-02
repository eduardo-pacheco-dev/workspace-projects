import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Divider,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import { MenuItem } from '@mui/material'
import api from '../../services/api'
import { settingsFields, emptySettings, Settings } from './settingsTypes'

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    let active = true
    api
      .get('/settings')
      .then((res) => {
        if (!active) return
        const data = res.data ?? {}
        setForm({ ...emptySettings, ...data })
      })
      .catch(() => {
        if (active) setMessage({ type: 'error', text: 'Não foi possível carregar as configurações.' })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleChange = (key: keyof Settings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const payload: Partial<Settings> = {}
      for (const field of settingsFields) {
        payload[field.key] = form[field.key]
      }
      await api.put('/settings', payload)
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso.' })
    } catch (err: any) {
      const msg = err.response?.data?.message
      setMessage({ type: 'error', text: Array.isArray(msg) ? msg.join(', ') : (msg || 'Não foi possível salvar as configurações.') })
    } finally {
      setSaving(false)
    }
  }

  const renderField = (key: keyof Settings, field: (typeof settingsFields)[number]) => {
    const common = {
      fullWidth: true,
      size: 'small' as const,
      label: field.label,
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(key, e.target.value),
    }

    if (field.type === 'select') {
      return (
        <TextField select {...common}>
          {field.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )
    }

    if (field.type === 'textarea') {
      return <TextField multiline rows={2} {...common} />
    }

    return <TextField type={field.type === 'email' ? 'email' : 'text'} {...common} />
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SettingsIcon color="primary" />
        <Typography variant="h4">Configurações do Sistema</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Dados gerais da empresa e preferências do sistema.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Empresa
        </Typography>
        <Grid container spacing={2}>
          {settingsFields.slice(0, 5).map((field) => (
            <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={field.key}>
              {renderField(field.key, field)}
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Preferências
        </Typography>
        <Grid container spacing={2}>
          {settingsFields.slice(5).map((field) => (
            <Grid item xs={12} sm={4} key={field.key}>
              {renderField(field.key, field)}
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
