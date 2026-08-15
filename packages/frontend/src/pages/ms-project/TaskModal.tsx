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
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import api from '../../services/api'
import { getFieldErrors } from '../../schemas/authSchemas'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { taskSchema } from './msProjectSchemas'
import { MsTask, taskPriorityOptions, dependencyTypeOptions } from './msProjectTypes'

interface TaskModalProps {
  projectId: number
  open: boolean
  editId?: number | null
  tasks: MsTask[]
  onClose: () => void
  onSaved: () => void
}

export default function TaskModal({ projectId, open, editId, tasks, onClose, onSaved }: TaskModalProps) {
  const isEdit = Boolean(editId)

  const [name, setName] = useState('')
  const [durationDays, setDurationDays] = useState('1')
  const [milestone, setMilestone] = useState(false)
  const [percentComplete, setPercentComplete] = useState('0')
  const [priority, setPriority] = useState('medium')
  const [notes, setNotes] = useState('')
  const [predecessorId, setPredecessorId] = useState('')
  const [depType, setDepType] = useState('FS')
  const [lagDays, setLagDays] = useState('0')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/ms-project/${projectId}`)
        .then((res) => {
          const task = res.data.tasks.find((t: MsTask) => t.id === editId)
          if (!task) return
          setName(task.name)
          setDurationDays(String(task.durationDays))
          setMilestone(task.milestone)
          setPercentComplete(String(task.percentComplete))
          setPriority(task.priority)
          setNotes(task.notes || '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId, projectId])

  const reset = () => {
    setName('')
    setDurationDays('1')
    setMilestone(false)
    setPercentComplete('0')
    setPriority('medium')
    setNotes('')
    setPredecessorId('')
    setDepType('FS')
    setLagDays('0')
    setError('')
    setFieldErrors({})
    setDeleting(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = taskSchema.safeParse({ name, durationDays, milestone, percentComplete, priority, notes, predecessorId, depType, lagDays })
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      const duration = milestone ? 0 : Math.max(0, Number(durationDays) || 1)
      const percent = Math.max(0, Math.min(100, Number(percentComplete) || 0))
      if (isEdit) {
        await api.patch(`/ms-project/tasks/${editId}`, {
          name,
          durationDays: duration,
          milestone,
          percentComplete: percent,
          priority,
          notes,
        })
      } else {
        const created = await api.post(`/ms-project/${projectId}/tasks`, {
          name,
          durationDays: duration,
          milestone,
          percentComplete: percent,
          priority,
          notes,
        })
        if (predecessorId) {
          const createdTask = created.data.tasks[created.data.tasks.length - 1]
          await api.post(`/ms-project/${projectId}/dependencies`, {
            taskId: createdTask.id,
            predecessorTaskId: Number(predecessorId),
            type: depType,
            lagDays: Number(lagDays) || 0,
          })
        }
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
      await api.delete(`/ms-project/tasks/${editId}`)
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
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duração (dias úteis)"
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                margin="normal"
                disabled={milestone}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="% Concluído"
                type="number"
                value={percentComplete}
                onChange={(e) => setPercentComplete(e.target.value)}
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Prioridade"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                margin="normal"
              >
                {taskPriorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Checkbox checked={milestone} onChange={(e) => setMilestone(e.target.checked)} />}
                label="Marco (duração zero)"
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Observações"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />
          {!isEdit && (
            <>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Predecessora (dependência)"
                    value={predecessorId}
                    onChange={(e) => setPredecessorId(e.target.value)}
                    margin="normal"
                  >
                    <MenuItem value="">Sem dependência</MenuItem>
                    {tasks.map((task) => (
                      <MenuItem key={task.id} value={task.id}>{task.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    select
                    label="Tipo"
                    value={depType}
                    onChange={(e) => setDepType(e.target.value)}
                    margin="normal"
                    disabled={!predecessorId}
                  >
                    {dependencyTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.value}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Lag (dias úteis)"
                    type="number"
                    value={lagDays}
                    onChange={(e) => setLagDays(e.target.value)}
                    margin="normal"
                    disabled={!predecessorId}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEdit && (
            <Tooltip title="Excluir tarefa">
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
        title="Excluir tarefa"
        message="Tem certeza que deseja excluir esta tarefa?"
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
