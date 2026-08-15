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
} from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import { formatPhone } from '../../utils/phone'
import type { Responsavel } from './clientsTypes'
import { responsavelSchema } from './clientSchemas'

interface ResponsavelModalProps {
  open: boolean
  clientId: number
  editData?: Responsavel | null
  onClose: () => void
  onSaved: () => void
}

interface ResponsavelFormState {
  nome: string
  sobrenome: string
  email: string
  telefone: string
  funcao: string
}

const initialForm: ResponsavelFormState = {
  nome: '',
  sobrenome: '',
  email: '',
  telefone: '',
  funcao: '',
}

export default function ResponsavelModal({ open, clientId, editData, onClose, onSaved }: ResponsavelModalProps) {
  const isEdit = Boolean(editData)
  const { showToast } = useToast()
  const [form, setForm] = useState<ResponsavelFormState>(initialForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        nome: editData?.nome || '',
        sobrenome: editData?.sobrenome || '',
        email: editData?.email || '',
        telefone: editData?.telefone ? formatPhone(editData.telefone) : '',
        funcao: editData?.funcao || '',
      })
      setError('')
      setFieldErrors({})
    }
  }, [open, editData])

  const handleChange = (key: keyof ResponsavelFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = responsavelSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload = { ...form }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/clients/responsaveis/${editData?.id}`, payload)
      } else {
        await api.post(`/clients/${clientId}/responsaveis`, payload)
      }
      showToast(isEdit ? 'Responsável atualizado com sucesso.' : 'Responsável criado com sucesso.')
      onSaved()
      handleClose()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Não foi possível salvar. Tente novamente.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setFieldErrors({})
    setForm(initialForm)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Responsável' : 'Novo Responsável'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                margin="normal"
                required
                error={!!fieldErrors.nome}
                helperText={fieldErrors.nome}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sobrenome"
                value={form.sobrenome}
                onChange={(e) => handleChange('sobrenome', e.target.value)}
                margin="normal"
                required
                error={!!fieldErrors.sobrenome}
                helperText={fieldErrors.sobrenome}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={form.telefone}
                onChange={(e) => handleChange('telefone', formatPhone(e.target.value))}
                margin="normal"
                placeholder="(00) 00000-0000"
                inputProps={{ maxLength: 15 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Função" value={form.funcao} onChange={(e) => handleChange('funcao', e.target.value)} margin="normal" placeholder="Ex.: Diretor de TI" />
            </Grid>
          </Grid>
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
