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
import api from '../../services/api'
import { getFieldErrors } from '../../schemas/authSchemas'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DateTimeField from '../../components/schedule/DateTimeField'
import { ScheduleEvent, statusOptions, splitDateTime, joinDateTime, toDateString } from './scheduleTypes'
import { createScheduleSchema, updateScheduleSchema } from './scheduleSchemas'

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
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const startAt = joinDateTime(startDate, startTime)
    const endAt = joinDateTime(endDate, endTime)

    const payload: any = {
      title,
      description,
      startAt: startAt || undefined,
      endAt: endAt || undefined,
      location,
      client,
      assignedTo,
    }
    if (isEdit) payload.status = status

    const schema = isEdit ? updateScheduleSchema : createScheduleSchema
    const result = schema.safeParse(payload)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

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
          <DateTimeField
            date={startDate}
            time={startTime}
            dateLabel="Data de Início"
            timeLabel="Hora de Início"
            onDateChange={setStartDate}
            onTimeChange={setStartTime}
            onClearError={() => clearFieldError('startAt')}
          />
          <DateTimeField
            date={endDate}
            time={endTime}
            dateLabel="Data de Fim"
            timeLabel="Hora de Fim"
            onDateChange={setEndDate}
            onTimeChange={setEndTime}
            onClearError={() => clearFieldError('endAt')}
          />
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
              <IconButton color="error" onClick={() => setConfirmDelete(true)} disabled={loading || deleting} sx={{ mr: 'auto' }}>
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

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir agendamento"
        message="Tem certeza que deseja excluir este agendamento?"
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
