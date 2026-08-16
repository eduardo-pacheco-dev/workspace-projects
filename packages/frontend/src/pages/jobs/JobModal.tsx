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
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import { jobSchema } from './jobSchemas'
import { jobTipoOptions, jobStatusOptions } from './jobsTypes'

interface JobModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface JobFormState {
  nome: string
  tipo: string
  cronExpression: string
  descricao: string
  status: string
}

const initialForm: JobFormState = {
  nome: '',
  tipo: 'ECHO',
  cronExpression: '0 0 * * *',
  descricao: '',
  status: 'ativo',
}

export default function JobModal({ open, editId, onClose, onSaved }: JobModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()
  const [form, setForm] = useState<JobFormState>(initialForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api.get(`/jobs/${editId}`)
        .then((res) => {
          const d = res.data
          setForm({
            nome: d.nome || '',
            tipo: d.tipo || 'ECHO',
            cronExpression: d.cronExpression || '',
            descricao: d.descricao || '',
            status: d.status || 'ativo',
          })
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const handleChange = (key: keyof JobFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = jobSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/jobs/${editId}`, form)
      } else {
        await api.post('/jobs', form)
      }
      showToast(isEdit ? 'Job atualizado com sucesso.' : 'Job criado com sucesso.')
      onSaved()
      handleClose()
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível salvar. Tente novamente.'
      setError(message)
      showToast(message, 'error')
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
        <DialogTitle>{isEdit ? 'Editar Job' : 'Novo Job'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={form.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  margin="normal"
                  required
                  error={!!fieldErrors.nome}
                  helperText={fieldErrors.nome || 'Ex: Limpeza de Logs, Relatório Semanal'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Tipo da rotina"
                  value={form.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
                  margin="normal"
                  required
                  error={!!fieldErrors.tipo}
                  helperText={fieldErrors.tipo}
                >
                  {jobTipoOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  margin="normal"
                  required
                >
                  {jobStatusOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expressão Cron"
                  value={form.cronExpression}
                  onChange={(e) => handleChange('cronExpression', e.target.value)}
                  margin="normal"
                  required
                  error={!!fieldErrors.cronExpression}
                  helperText={fieldErrors.cronExpression || 'Ex: 0 0 * * * (diariamente à meia-noite)'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
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