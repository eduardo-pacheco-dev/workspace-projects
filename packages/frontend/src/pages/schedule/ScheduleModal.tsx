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
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { z } from 'zod'
import api from '../../services/api'
import {
  ScheduleEvent,
  statusOptions,
  splitDateTime,
  joinDateTime,
  toDateString,
} from './scheduleTypes'

const baseSchema = z.object({
  title: z.string().min(1, 'Informe o título.'),
  description: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  location: z.string().optional(),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface ScheduleModalProps {
  open: boolean
  editId?: number | null
  initialDate?: string | null
  onClose: () => void
  onSaved: () => void
}

export default function ScheduleModal({ open, editId, initialDate, onClose, onSaved }: ScheduleModalProps) {
  const isEdit = Boolean(editId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [client, setClient] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/schedule/${editId}`)
        .then((res) => {
          const d: ScheduleEvent = res.data
          setTitle(d.title)
          setDescription(d.description || '')
          const start = splitDateTime(d.startAt)
          const end = splitDateTime(d.endAt)
          setStartDate(start.date)
          setStartTime(start.time)
          setEndDate(end.date)
          setEndTime(end.time)
          setLocation(d.location || '')
          setClient(d.client || '')
          setAssignedTo(d.assignedTo || '')
          setStatus(d.status || 'scheduled')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const reset = () => {
    setTitle('')
    setDescription('')
    setStartDate(initialDate || toDateString(new Date()))
    setStartTime('')
    setEndDate('')
    setEndTime('')
    setLocation('')
    setClient('')
    setAssignedTo('')
    setStatus('scheduled')
    setError('')
    setFieldErrors({})
    setDeleting(false)
  }

  const getFieldErrors = (error: z.ZodError) =>
    Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const startAt = joinDateTime(startDate, startTime)
    const endAt = joinDateTime(endDate, endTime)

    const payload = {
      title,
      description,
      startAt: startAt || undefined,
      endAt: endAt || undefined,
      location,
      client,
      assignedTo,
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(payload)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    if (isEdit) (payload as any).status = status

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/schedule/${editId}`, payload)
      } else {
        await api.post('/schedule', payload)
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

  const handleDelete = async () => {
    if (!editId) return
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return
    setDeleting(true)
    try {
      await api.delete(`/schedule/${editId}`)
      reset()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (loading || deleting) return
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Título"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              clearFieldError('title')
            }}
            margin="normal"
            required
            autoFocus
            error={!!fieldErrors.title}
            helperText={fieldErrors.title}
          />
          <TextField
            fullWidth
            label="Descrição"
            multiline
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              clearFieldError('description')
            }}
            margin="normal"
            error={!!fieldErrors.description}
            helperText={fieldErrors.description}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Início"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  clearFieldError('startAt')
                }}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hora de Início"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  clearFieldError('startAt')
                }}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Fim"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  clearFieldError('endAt')
                }}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hora de Fim"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value)
                  clearFieldError('endAt')
                }}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Local"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  clearFieldError('location')
                }}
                margin="normal"
                error={!!fieldErrors.location}
                helperText={fieldErrors.location}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cliente"
                value={client}
                onChange={(e) => {
                  setClient(e.target.value)
                  clearFieldError('client')
                }}
                margin="normal"
                error={!!fieldErrors.client}
                helperText={fieldErrors.client}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Responsável"
            value={assignedTo}
            onChange={(e) => {
              setAssignedTo(e.target.value)
              clearFieldError('assignedTo')
            }}
            margin="normal"
            error={!!fieldErrors.assignedTo}
            helperText={fieldErrors.assignedTo}
          />
          {isEdit && (
            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              margin="normal"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEdit && (
            <Tooltip title="Excluir agendamento">
              <IconButton color="error" onClick={handleDelete} disabled={loading || deleting} sx={{ mr: 'auto' }}>
                <Delete />
              </IconButton>
            </Tooltip>
          )}
          <Button onClick={handleClose} disabled={loading || deleting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || deleting}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
