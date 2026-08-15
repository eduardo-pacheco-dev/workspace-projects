import { useState, useEffect } from 'react'
import { Alert, Button, Divider, Paper, Typography } from '@mui/material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { UserProfile } from './usersTypes'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ProfileHeader from '../../components/users/ProfileHeader'
import PersonalInfoForm from '../../components/users/PersonalInfoForm'
import ChangePasswordForm from '../../components/users/ChangePasswordForm'

export default function ProfileForm() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const [data, setData] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    api.get(`/users/${user.id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Não foi possível carregar o perfil.'))
  }, [user?.id])

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
      <ProfileHeader user={data} fullName={fullName} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Perfil atualizado com sucesso.</Alert>}

      {data && <PersonalInfoForm data={data} onChange={setData} onSubmit={handleSubmit} saving={saving} />}

      <Divider sx={{ my: 3 }} />
      {user?.id != null && <ChangePasswordForm userId={user.id} />}

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
