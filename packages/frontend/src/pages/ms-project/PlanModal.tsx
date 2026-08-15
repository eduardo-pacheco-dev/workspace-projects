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
import { getFieldErrors } from '../../schemas/authSchemas'
import WeekdayPicker from '../../components/ms-project/WeekdayPicker'
import { planSchema } from './msProjectSchemas'
import { MsProjectSummary, todayString } from './msProjectTypes'

interface PlanModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function PlanModal({ open, editId, onClose, onSaved }: PlanModalProps) {
  const isEdit = Boolean(editId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(todayString())
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/ms-project/${editId}`)
        .then((res) => {
          const d: MsProjectSummary = res.data
          setName(d.name)
          setDescription(d.description || '')
          setStartDate(d.startDate || todayString())
          setWorkingDays(Array.isArray(d.workingDays) ? d.workingDays : [1, 2, 3, 4, 5])
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const reset = () => {
    setName('')
    setDescription('')
    setStartDate(todayString())
    setWorkingDays([1, 2, 3, 4, 5])
    setError('')
    setFieldErrors({})
  }

  const toggleDay = (day: number) => {
    setWorkingDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()))
    setFieldErrors((prev) => ({ ...prev, workingDays: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = planSchema.safeParse({ name, description, startDate, workingDays })
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      const payload = { name, description, startDate, workingDays }
      if (isEdit) {
        await api.patch(`/ms-project/${editId}`, payload)
      } else {
        await api.post('/ms-project', payload)
      }
      reset()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Nome"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setFieldErrors((prev) => ({ ...prev, name: '' }))
            }}
            margin="normal"
            required
            autoFocus
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
          />
          <TextField
            fullWidth
            label="Descrição"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de início"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <WeekdayPicker selected={workingDays} onToggle={toggleDay} />
              {fieldErrors.workingDays && (
                <Alert severity="error" sx={{ mt: 1 }}>{fieldErrors.workingDays}</Alert>
              )}
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
