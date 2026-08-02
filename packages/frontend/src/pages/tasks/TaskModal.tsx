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
  Task,
  statusOptions,
  priorityOptions,
  splitDateTime,
  joinDateTime,
  toDateString,
} from './tasksTypes'

const baseSchema = z.object({
  title: z.string().min(1, 'Informe o título.'),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueAt: z.string().optional(),
  project: z.string().optional(),
  client: z.string().optional(),
  assignedTo: z.string().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface TaskModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function TaskModal({ open, editId, onClose, onSaved }: TaskModalProps) {
  const isEdit = Boolean(editId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('pending')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [project, setProject] = useState('')
  const [client, setClient] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/tasks/${editId}`)
        .then((res) => {
          const d: Task = res.data
          setTitle(d.title)
          setDescription(d.description || '')
          setStatus(d.status || 'pending')
          setPriority(d.priority || 'medium')
          const due = splitDateTime(d.dueAt)
          setDueDate(due.date)
          setDueTime(due.time)
          setProject(d.project || '')
          setClient(d.client || '')
          setAssignedTo(d.assignedTo || '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const reset = () => {
    setTitle('')
    setDescription('')
    setStatus('pending')
    setPriority('medium')
    setDueDate(toDateString(new Date()))
    setDueTime('')
    setProject('')
    setClient('')
    setAssignedTo('')
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

    const dueAt = joinDateTime(dueDate, dueTime)

    const payload = {
      title,
      description,
      status,
      priority,
      dueAt: dueAt || undefined,
      project,
      client,
      assignedTo,
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(payload)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/tasks/${editId}`, payload)
      } else {
        await api.post('/tasks', payload)
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
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    setDeleting(true)
    try {
      await api.delete(`/tasks/${editId}`)
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
        <DialogTitle>{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
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
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Prioridade"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                margin="normal"
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data de Vencimento"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  clearFieldError('dueAt')
                }}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hora de Vencimento"
                type="time"
                value={dueTime}
                onChange={(e) => {
                  setDueTime(e.target.value)
                  clearFieldError('dueAt')
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
                label="Projeto"
                value={project}
                onChange={(e) => {
                  setProject(e.target.value)
                  clearFieldError('project')
                }}
                margin="normal"
                error={!!fieldErrors.project}
                helperText={fieldErrors.project}
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEdit && (
            <Tooltip title="Excluir tarefa">
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
