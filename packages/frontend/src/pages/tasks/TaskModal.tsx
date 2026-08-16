import { useState, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import TextField from '../../components/ui/TextField'
import SelectField from '../../components/ui/SelectField'
import Button from '../../components/ui/Button'
import DeleteModal from '../../components/modals/DeleteModal'
import useTaskOptions from '../../hooks/useTaskOptions'
import MarkdownField from '../../components/tasks/MarkdownField'
import {
  Task,
  statusOptions,
  priorityOptions,
  splitDateTime,
  joinDateTime,
  toDateString,
  collaboratorName,
} from './tasksTypes'
import { createTaskSchema, updateTaskSchema } from './taskSchemas'

interface TaskModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

const STEPS = [{ label: 'Informações' }, { label: 'Status e Prazo' }, { label: 'Associação' }]

export default function TaskModal({ open, editId, onClose, onSaved }: TaskModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()
  const { projects, clients, collaborators } = useTaskOptions(open)

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
  const [stepError, setStepError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const isLastStep = activeStep === STEPS.length - 1

  useEffect(() => {
    if (open) {
      setActiveStep(0)
      setStepError('')
      if (editId) {
        setLoading(true)
        api
          .get(`/tasks/${editId}`)
          .then((res) => {
            const data: Task = res.data
            setTitle(data.title)
            setDescription(data.description || '')
            setStatus(data.status || 'pending')
            setPriority(data.priority || 'medium')
            const due = splitDateTime(data.dueAt)
            setDueDate(due.date)
            setDueTime(due.time)
            setProject(data.project || '')
            setClient(data.client || '')
            setAssignedTo(data.assignedTo || '')
          })
          .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
          .finally(() => setLoading(false))
      }
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
    setStepError('')
    setFieldErrors({})
    setDeleting(false)
    setConfirmDelete(false)
    setActiveStep(0)
  }

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const validateStep = () => {
    const missing: string[] = []
    if (activeStep === 0 && !title.trim()) missing.push('Título')

    if (missing.length) {
      setStepError(`Preencha os campos obrigatórios: ${missing.join(', ')}.`)
      return false
    }
    setStepError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStepError('')
    setActiveStep((prev) => Math.max(0, prev - 1))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isLastStep) {
      handleNext()
      return
    }
    if (!validateStep()) return

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

    const schema = isEdit ? updateTaskSchema : createTaskSchema
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
      const message = err.response?.data?.message || 'Não foi possível salvar. Tente novamente.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    setDeleting(true)
    try {
      await api.delete(`/tasks/${editId}`)
      showToast('Tarefa excluída com sucesso.')
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
        <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        <DialogContent>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              my: 2,
              '& .MuiStepConnector-line': { borderColor: 'divider' },
              '& .MuiStepLabel-label': { fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 },
              '& .MuiStepLabel-label.Mui-active': { fontWeight: 700, color: 'rgb(0, 21, 68)' },
              '& .MuiStepLabel-label.Mui-completed': { fontWeight: 600, color: 'text.primary' },
              '& .MuiStepIcon-root.Mui-active': { color: 'rgb(0, 21, 68)' },
              '& .MuiStepIcon-root.Mui-completed': { color: 'rgb(0, 21, 68)' },
              '& .MuiStepIcon-text': { fontWeight: 600 },
            }}
          >
            {STEPS.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            Passo {activeStep + 1} de {STEPS.length} — {STEPS[activeStep].label}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {stepError && <Alert severity="warning" sx={{ mb: 2 }}>{stepError}</Alert>}

          {activeStep === 0 && (
            <>
              <TextField
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
              <MarkdownField
                value={description}
                onChange={(value) => {
                  setDescription(value)
                  clearFieldError('description')
                }}
                error={fieldErrors.description}
              />
            </>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <SelectField
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  margin="normal"
                  options={statusOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectField
                  label="Prioridade"
                  value={priority}
                  onChange={setPriority}
                  margin="normal"
                  options={priorityOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
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
              <Grid item xs={12} sm={6}>
                <TextField
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
          )}

          {activeStep === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <SelectField
                  label="Projeto"
                  value={project}
                  onChange={(value) => {
                    setProject(value)
                    if (!client) {
                      const selected = projects.find((p) => p.nome === value)
                      if (selected?.cliente) setClient(selected.cliente)
                    }
                    clearFieldError('project')
                  }}
                  margin="normal"
                  error={!!fieldErrors.project}
                  helperText={fieldErrors.project || 'Opcional'}
                  options={[
                    { value: '', label: 'Sem projeto' },
                    ...projects.map((p) => ({ value: p.nome, label: p.nome })),
                  ]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectField
                  label="Cliente"
                  value={client}
                  onChange={(value) => {
                    setClient(value)
                    clearFieldError('client')
                  }}
                  margin="normal"
                  error={!!fieldErrors.client}
                  helperText={fieldErrors.client || 'Opcional'}
                  options={[
                    { value: '', label: 'Sem cliente' },
                    ...clients.map((c) => ({ value: c, label: c })),
                  ]}
                />
              </Grid>
              <Grid item xs={12}>
                <SelectField
                  label="Responsável"
                  value={assignedTo}
                  onChange={(value) => {
                    setAssignedTo(value)
                    clearFieldError('assignedTo')
                  }}
                  margin="normal"
                  error={!!fieldErrors.assignedTo}
                  helperText={fieldErrors.assignedTo || 'Opcional'}
                  options={[
                    { value: '', label: 'Sem responsável' },
                    ...collaborators.map((c) => ({ value: collaboratorName(c), label: collaboratorName(c) })),
                  ]}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isEdit && (
              <Tooltip title="Excluir tarefa">
                <IconButton color="error" onClick={() => setConfirmDelete(true)} disabled={loading || deleting}>
                  <Delete />
                </IconButton>
              </Tooltip>
            )}
            <Button onClick={handleClose} disabled={loading || deleting}>Cancelar</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0 || loading || deleting}>
              Voltar
            </Button>
            {isLastStep ? (
              <Button type="submit" variant="contained" disabled={loading || deleting}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
              </Button>
            ) : (
              <Button type="submit" variant="contained" disabled={loading || deleting}>
                Próximo
              </Button>
            )}
          </Box>
        </DialogActions>
      </Box>

      <DeleteModal
        open={confirmDelete}
        title="Excluir tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta ação não poderá ser desfeita."
        deleting={deleting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
