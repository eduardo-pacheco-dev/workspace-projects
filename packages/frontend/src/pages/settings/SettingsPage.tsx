import { useState, useEffect } from 'react'
import { Alert, Container, Paper, Tab, Tabs, CircularProgress, Typography } from '@mui/material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import ProfileForm from '../users/ProfileForm'
import { settingsFields, companyFields, emptySettings, emptyCompany, Settings, CompanyForm } from './settingsTypes'
import { DEFAULT_ROLE_MODULES, parseRoleModules } from './roleModules'
import SettingsHeader from '../../components/settings/SettingsHeader'
import SettingsForm from '../../components/settings/SettingsForm'
import RoleModulesForm from '../../components/settings/RoleModulesForm'

type Message = { type: 'success' | 'error'; text: string } | null

function getErrorMessage(err: any, fallback: string): string {
  const msg = err.response?.data?.message
  return Array.isArray(msg) ? msg.join(', ') : (msg || fallback)
}

export default function SettingsPage() {
  const { user } = useAuth()
  const isMaster = user?.role === 'master'
  const canEditSystem = isMaster || user?.role === 'admin'
  const canEditCompany = user?.role === 'admin'
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState<Settings>(emptySettings)
  const [company, setCompany] = useState<CompanyForm>(emptyCompany)
  const [selectedRole, setSelectedRole] = useState('user')
  const [roleModules, setRoleModules] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [settingsRes, companyRes] = await Promise.all([
          api.get('/settings'),
          user?.companyId ? api.get('/companies/me').catch(() => null) : Promise.resolve(null),
        ])
        if (!active) return
        const data = settingsRes.data ?? {}
        setForm({ ...emptySettings, ...data })
        setRoleModules(parseRoleModules(data))
        if (companyRes?.data) setCompany({ ...emptyCompany, ...companyRes.data })
      } catch {
        if (active) setMessage({ type: 'error', text: 'Não foi possível carregar as configurações.' })
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
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
        payload[field.key as keyof Settings] = form[field.key as keyof Settings]
      }
      await api.put('/settings', payload)
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Não foi possível salvar as configurações.') })
    } finally {
      setSaving(false)
    }
  }

  const handleCompanyChange = (key: keyof CompanyForm, value: string) => {
    setCompany((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await api.patch('/companies/me', company)
      setCompany({ ...emptyCompany, ...res.data })
      if (res.data?.nome) {
        const stored = localStorage.getItem('user')
        if (stored) {
          try {
            const storedUser = JSON.parse(stored)
            storedUser.companyName = res.data.nome
            localStorage.setItem('user', JSON.stringify(storedUser))
          } catch {
            // ignora falha ao atualizar cache do usuário
          }
        }
      }
      setMessage({ type: 'success', text: 'Dados da empresa salvos com sucesso.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Não foi possível salvar os dados da empresa.') })
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
      setMessage({ type: 'error', text: getErrorMessage(err, 'Não foi possível salvar os perfis.') })
    } finally {
      setSaving(false)
    }
  }

  const showPerfis = isMaster && tab === 2
  const showPerfil = isMaster ? tab === 3 : tab === 2

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      <SettingsHeader />

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
        <RoleModulesForm
          selectedRole={selectedRole}
          modules={currentRoleModules}
          saving={saving}
          onRoleChange={setSelectedRole}
          onToggleModule={toggleModule}
          onSave={handleSaveRoles}
        />
      ) : showPerfil ? (
        <ProfileForm />
      ) : tab === 1 ? (
        user?.companyId ? (
          <SettingsForm
            title="Configuração da Empresa"
            fields={companyFields}
            values={company}
            onChange={(key, value) => handleCompanyChange(key as keyof CompanyForm, value)}
            onSubmit={handleCompanySubmit}
            saving={saving}
            disabled={!canEditCompany}
            disabledMessage={!canEditCompany ? 'Apenas administradores podem alterar os dados da empresa.' : undefined}
          />
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Configuração da Empresa
            </Typography>
            <Alert severity="info">
              Seu usuário não está vinculado a uma empresa. Gerencie as empresas no módulo de Empresas.
            </Alert>
          </Paper>
        )
      ) : (
        <SettingsForm
          title="Configuração Geral do Sistema"
          fields={settingsFields}
          values={form}
          onChange={(key, value) => handleChange(key as keyof Settings, value)}
          onSubmit={handleSubmit}
          saving={saving}
          disabled={!canEditSystem}
          disabledMessage={!canEditSystem ? 'Apenas administradores podem alterar estas configurações.' : undefined}
        />
      )}
    </Container>
  )
}
