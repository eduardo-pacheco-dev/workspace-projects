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
  Tabs,
  Tab,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import GroupIcon from '@mui/icons-material/Group'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import ProfileForm from '../users/ProfileForm'
import { settingsFields, emptySettings, Settings, SettingsField } from './settingsTypes'
import {
  ALL_ROLE_MODULES,
  DEFAULT_ROLE_MODULES,
  roleLabels,
} from './roleModules'

const companyKeys: (keyof Settings)[] = [
  'companyName',
  'companyCnpj',
  'companyPhone',
  'companyEmail',
  'companyAddress',
]

const systemKeys: (keyof Settings)[] = ['timezone', 'language', 'currency']

const configurableRoles = ['admin', 'supervisor', 'coordenador', 'analista', 'technician', 'user']

export default function SettingsPage() {
  const { user } = useAuth()
  const isMaster = user?.role === 'master'
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState<Settings>(emptySettings)
  const [selectedRole, setSelectedRole] = useState('user')
  const [roleModules, setRoleModules] = useState<Record<string, string[]>>({})
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
        const map: Record<string, string[]> = {}
        for (const role of configurableRoles) {
          const raw = data[`role_modules_${role}`]
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed)) map[role] = parsed
            } catch {
              map[role] = [...(DEFAULT_ROLE_MODULES[role] ?? [])]
            }
          }
        }
        setRoleModules(map)
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

  const currentRoleModules = roleModules[selectedRole] ?? [...(DEFAULT_ROLE_MODULES[selectedRole] ?? [])]

  const toggleModule = (value: string) => {
    const next = currentRoleModules.includes(value)
      ? currentRoleModules.filter((m) => m !== value)
      : [...currentRoleModules, value]
    setRoleModules((prev) => ({ ...prev, [selectedRole]: next }))
    setMessage(null)
  }

  const handleSaveRoles = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await api.put('/settings', {
        [`role_modules_${selectedRole}`]: JSON.stringify(currentRoleModules),
      })
      setMessage({ type: 'success', text: 'Perfis de acesso salvos com sucesso.' })
    } catch (err: any) {
      const msg = err.response?.data?.message
      setMessage({ type: 'error', text: Array.isArray(msg) ? msg.join(', ') : (msg || 'Não foi possível salvar os perfis.') })
    } finally {
      setSaving(false)
    }
  }

  const renderField = (key: keyof Settings, field: SettingsField) => {
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

  const showPerfis = isMaster && tab === 2
  const showPerfil = isMaster ? tab === 3 : tab === 2
  const activeKeys = tab === 0 ? systemKeys : tab === 1 ? companyKeys : []
  const activeFields = settingsFields.filter((f) => activeKeys.includes(f.key))
  const activeTitle = tab === 0 ? 'Configuração Geral do Sistema' : tab === 1 ? 'Configuração da Empresa' : 'Perfis de Acesso'

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
        <Typography variant="h4">Configurações</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Preferências do sistema, dados da empresa e perfis de acesso.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={isMaster ? tab : Math.min(tab, 2)} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Sistema" />
          <Tab label="Empresa" />
          {isMaster && <Tab label="Perfis" />}
          <Tab label="Perfil" />
        </Tabs>
      </Paper>

      {showPerfis ? (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <GroupIcon color="primary" />
            <Typography variant="h6">Perfis de Acesso</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione o perfil e marque quais módulos ele pode acessar. O perfil master tem acesso total e não é configurável.
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="Perfil"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            sx={{ mb: 3, maxWidth: 280 }}
          >
            {configurableRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {roleLabels[role] || role}
              </MenuItem>
            ))}
          </TextField>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={1}>
            {ALL_ROLE_MODULES.map((module) => (
              <Grid item xs={12} sm={6} md={4} key={module.value}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentRoleModules.includes(module.value)}
                      onChange={() => toggleModule(module.value)}
                    />
                  }
                  label={module.label}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={handleSaveRoles}>
              {saving ? 'Salvando...' : 'Salvar perfis'}
            </Button>
          </Box>
        </Paper>
      ) : showPerfil ? (
        <ProfileForm />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {activeTitle}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {activeFields.map((field) => (
                <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={field.key}>
                  {renderField(field.key, field)}
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  )
}
