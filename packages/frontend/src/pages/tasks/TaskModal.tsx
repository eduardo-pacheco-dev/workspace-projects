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
  Tabs,
  Tab,
  Paper,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { z } from 'zod'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import Markdown from '../../components/Markdown'
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

interface ProjectOption {
  id: number
  nome: string
  cliente: string | null
}

interface CollaboratorOption {
  id: number
  nome: string | null
  firstName?: string | null
  lastName?: string | null
}

const collaboratorName = (c: CollaboratorOption) =>
  c.nome || [c.firstName, c.lastName].filter(Boolean).join(' ')

export default function TaskModal({ open, editId, onClose, onSaved }: TaskModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('pending')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [project, setProject] = useState('')
  const [client, setClient] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [clients, setClients] = useState<string[]>([])
  const [collaborators, setCollaborators] = useState<CollaboratorOption[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open) return
    api
      .get('/projects', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const d = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setProjects(d)
        const clientSet = new Set<string>()
        d.forEach((p: any) => { if (p.cliente) clientSet.add(p.cliente) })
        setClients(Array.from(clientSet))
      })
      .catch(() => {})
    api
      .get('/collaborators', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const d = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setCollaborators(d)
      })
      .catch(() => {})
  }, [open])

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
    setPreviewMode(false)
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
      showToast(isEdit ? 'Tarefa atualizada com sucesso.' : 'Tarefa criada com sucesso.')
      reset()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
      showToast(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.', 'error')
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
          <Tabs
            value={previewMode ? 1 : 0}
            onChange={(_, v) => setPreviewMode(v === 1)}
            sx={{ mt: 1, mb: 0.5, minHeight: 32 }}
          >
            <Tab label="Editar" sx={{ minHeight: 32, p: 0.5 }} />
            <Tab label="Preview" sx={{ minHeight: 32, p: 0.5 }} />
          </Tabs>
          {previewMode ? (
            <Paper variant="outlined" sx={{ p: 2, minHeight: 100, bgcolor: 'background.default' }}>
              <Markdown>{description}</Markdown>
            </Paper>
          ) : (
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
              helperText={fieldErrors.description || 'Suporta Markdown'}
            />
          )}
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
                select
                label="Projeto"
                value={project}
                onChange={(e) => {
                  setProject(e.target.value)
                  if (!client) {
                    const selected = projects.find((p) => p.nome === e.target.value)
                    if (selected?.cliente) setClient(selected.cliente)
                  }
                  clearFieldError('project')
                }}
                margin="normal"
                error={!!fieldErrors.project}
                helperText={fieldErrors.project || 'Opcional'}
              >
                <MenuItem value="">Sem projeto</MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.nome}>{p.nome}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Cliente"
                value={client}
                onChange={(e) => {
                  setClient(e.target.value)
                  clearFieldError('client')
                }}
                margin="normal"
                error={!!fieldErrors.client}
                helperText={fieldErrors.client || 'Opcional'}
              >
                <MenuItem value="">Sem cliente</MenuItem>
                {clients.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
            fullWidth
            select
            label="Responsável"
            value={assignedTo}
            onChange={(e) => {
              setAssignedTo(e.target.value)
              clearFieldError('assignedTo')
            }}
            margin="normal"
            error={!!fieldErrors.assignedTo}
            helperText={fieldErrors.assignedTo || 'Opcional'}
          >
            <MenuItem value="">Sem responsável</MenuItem>
            {collaborators.map((c) => (
              <MenuItem key={c.id} value={collaboratorName(c)}>{collaboratorName(c)}</MenuItem>
            ))}
          </TextField>
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
