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

const STEPS = [{ label: 'Informações' }, { label: 'Data e Hora' }, { label: 'Detalhes' }]

export default function ScheduleModal({ open, editId, initialDate, onClose, onSaved }: ScheduleModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()

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
    setStepError('')
    setFieldErrors({})
    setDeleting(false)
    setActiveStep(0)
  }

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const validateStep = () => {
    const missing: string[] = []
    if (activeStep === 0 && !title.trim()) missing.push('Título')
    if (activeStep === 1 && (!startDate || !startTime)) missing.push('Data e hora de início')

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
      showToast(isEdit ? 'Agendamento atualizado com sucesso.' : 'Agendamento criado com sucesso.')
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
      showToast('Agendamento excluído com sucesso.')
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
        <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
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
              <TextField
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
            </>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DateTimeField
                  date={startDate}
                  time={startTime}
                  dateLabel="Data de Início"
                  timeLabel="Hora de Início"
                  onDateChange={setStartDate}
                  onTimeChange={setStartTime}
                  onClearError={() => clearFieldError('startAt')}
                />
              </Grid>
              <Grid item xs={12}>
                <DateTimeField
                  date={endDate}
                  time={endTime}
                  dateLabel="Data de Fim"
                  timeLabel="Hora de Fim"
                  onDateChange={setEndDate}
                  onTimeChange={setEndTime}
                  onClearError={() => clearFieldError('endAt')}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
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
              <Grid item xs={12}>
                <TextField
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
              </Grid>
              {isEdit && (
                <Grid item xs={12}>
                  <SelectField
                    label="Status"
                    value={status}
                    onChange={setStatus}
                    margin="normal"
                    options={statusOptions.map((option) => ({ value: option.value, label: option.label }))}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isEdit && (
              <Tooltip title="Excluir agendamento">
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
        title="Excluir agendamento"
        message="Tem certeza que deseja excluir este agendamento? Esta ação não poderá ser desfeita."
        deleting={deleting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
