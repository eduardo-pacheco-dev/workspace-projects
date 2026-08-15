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
import { pdcaActionSchema } from './pdcaSchemas'
import { statusAcaoOptions, PdcaAction } from './pdcaTypes'

interface PdcaActionModalProps {
  open: boolean
  pdcaId: number
  editData?: PdcaAction | null
  onClose: () => void
  onSaved: () => void
}

interface ActionFormState {
  what: string
  why: string
  ondeAplicacao: string
  whenInicio: string
  whenPrazo: string
  who: string
  how: string
  howMuch: string
  status: string
  progresso: string
  observacoes: string
}

const initialForm: ActionFormState = {
  what: '',
  why: '',
  ondeAplicacao: '',
  whenInicio: '',
  whenPrazo: '',
  who: '',
  how: '',
  howMuch: '',
  status: 'pendente',
  progresso: '0',
  observacoes: '',
}

export default function PdcaActionModal({ open, pdcaId, editData, onClose, onSaved }: PdcaActionModalProps) {
  const isEdit = Boolean(editData)
  const { showToast } = useToast()
  const [form, setForm] = useState<ActionFormState>(initialForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        what: editData?.what || '',
        why: editData?.why || '',
        ondeAplicacao: editData?.ondeAplicacao || '',
        whenInicio: editData?.whenInicio || '',
        whenPrazo: editData?.whenPrazo || '',
        who: editData?.who || '',
        how: editData?.how || '',
        howMuch: editData?.howMuch != null ? String(editData.howMuch) : '',
        status: editData?.status || 'pendente',
        progresso: editData?.progresso != null ? String(editData.progresso) : '0',
        observacoes: editData?.observacoes || '',
      })
      setError('')
      setFieldErrors({})
    }
  }, [open, editData])

  const handleChange = (key: keyof ActionFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = pdcaActionSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = {
      ...form,
      howMuch: form.howMuch !== '' ? Number(form.howMuch) : undefined,
      progresso: Number(form.progresso) || 0,
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/pdca/${pdcaId}/actions/${editData?.id}`, payload)
      } else {
        await api.post(`/pdca/${pdcaId}/actions`, payload)
      }
      showToast(isEdit ? 'Ação atualizada com sucesso.' : 'Ação criada com sucesso.')
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Ação (5W2H)' : 'Nova Ação (5W2H)'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="What — O que fazer"
                value={form.what}
                onChange={(e) => handleChange('what', e.target.value)}
                margin="normal"
                required
                error={!!fieldErrors.what}
                helperText={fieldErrors.what}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Why — Por que" multiline rows={2} value={form.why} onChange={(e) => handleChange('why', e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Where — Onde aplicar" value={form.ondeAplicacao} onChange={(e) => handleChange('ondeAplicacao', e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="When — Início" type="date" value={form.whenInicio} onChange={(e) => handleChange('whenInicio', e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="When — Prazo limite" type="date" value={form.whenPrazo} onChange={(e) => handleChange('whenPrazo', e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Who — Responsável" value={form.who} onChange={(e) => handleChange('who', e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="How much — Custo estimado (R$)" type="number" value={form.howMuch} onChange={(e) => handleChange('howMuch', e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="How — Como / Método" multiline rows={2} value={form.how} onChange={(e) => handleChange('how', e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Status" value={form.status} onChange={(e) => handleChange('status', e.target.value)} margin="normal">
                {statusAcaoOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Progresso (%)"
                type="number"
                value={form.progresso}
                onChange={(e) => handleChange('progresso', e.target.value)}
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
                error={!!fieldErrors.progresso}
                helperText={fieldErrors.progresso}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Observações / Evidências" multiline rows={2} value={form.observacoes} onChange={(e) => handleChange('observacoes', e.target.value)} margin="normal" />
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
