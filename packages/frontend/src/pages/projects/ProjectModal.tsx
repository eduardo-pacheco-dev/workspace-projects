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
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import TextField from '../../components/ui/TextField'
import SelectField from '../../components/ui/SelectField'
import Button from '../../components/ui/Button'
import useProjectOptions from '../../hooks/useProjectOptions'
import FreeSoloAutocomplete from '../../components/projects/FreeSoloAutocomplete'
import { projectSchema } from './projectSchemas'
import { OPERADORAS } from './projectsTypes'

interface ProjectModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface ProjectFormState {
  nome: string
  descricao: string
  cliente: string
  operadora: string
  responsavel: string
  dataInicio: string
  dataFim: string
  observacoes: string
  status: string
}

const initialForm: ProjectFormState = {
  nome: '',
  descricao: '',
  cliente: '',
  operadora: '',
  responsavel: '',
  dataInicio: '',
  dataFim: '',
  observacoes: '',
  status: 'ativo',
}

const STEPS = [{ label: 'Identificação' }, { label: 'Datas e Status' }, { label: 'Detalhes' }]

export default function ProjectModal({ open, editId, onClose, onSaved }: ProjectModalProps) {
  const isEdit = Boolean(editId)
  const { user } = useAuth()
  const { showToast } = useToast()
  const { clients, users } = useProjectOptions(open, user?.name)
  const [form, setForm] = useState<ProjectFormState>(initialForm)
  const [indeterminado, setIndeterminado] = useState(false)
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const isLastStep = activeStep === STEPS.length - 1

  useEffect(() => {
    if (open) {
      setActiveStep(0)
      setStepError('')
      if (editId) {
        api.get(`/projects/${editId}`)
          .then((res) => {
            const d = res.data
            setForm({
              nome: d.nome || '',
              descricao: d.descricao || '',
              cliente: d.cliente || '',
              operadora: d.operadora || '',
              responsavel: d.responsavel || '',
              dataInicio: d.dataInicio || '',
              dataFim: d.dataFim || '',
              observacoes: d.observacoes || '',
              status: d.status || 'ativo',
            })
            setIndeterminado(!d.dataFim)
          })
          .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      }
    }
  }, [open, editId])

  const handleChange = (key: keyof ProjectFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validateStep = () => {
    const missing: string[] = []
    if (activeStep === 0 && !form.nome.trim()) missing.push('Nome')
    if (activeStep === 1 && !form.status) missing.push('Status')

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

    const result = projectSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = { ...form }
    payload.dataFim = indeterminado ? '' : form.dataFim

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/projects/${editId}`, payload)
      } else {
        await api.post('/projects', payload)
      }
      onSaved()
      handleClose()
      showToast(isEdit ? 'Projeto atualizado com sucesso.' : 'Projeto criado com sucesso.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setStepError('')
    setFieldErrors({})
    setForm(initialForm)
    setIndeterminado(false)
    setActiveStep(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome"
                  value={form.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  margin="normal"
                  required
                  error={!!fieldErrors.nome}
                  helperText={fieldErrors.nome}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FreeSoloAutocomplete
                  label="Cliente"
                  options={clients}
                  value={form.cliente}
                  onChange={(value) => handleChange('cliente', value)}
                  placeholder="Selecione ou digite um cliente"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FreeSoloAutocomplete
                  label="Responsável"
                  options={users}
                  value={form.responsavel}
                  onChange={(value) => handleChange('responsavel', value)}
                  placeholder="Selecione um usuário da empresa"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectField
                  label="Operadora"
                  value={form.operadora}
                  onChange={(value) => handleChange('operadora', value)}
                  margin="normal"
                  options={[
                    { value: '', label: 'Selecione' },
                    ...OPERADORAS.map((operadora) => ({ value: operadora, label: operadora })),
                  ]}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data de Início"
                  type="date"
                  value={form.dataInicio}
                  onChange={(e) => handleChange('dataInicio', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data de Término"
                  type="date"
                  value={form.dataFim}
                  onChange={(e) => handleChange('dataFim', e.target.value)}
                  margin="normal"
                  disabled={indeterminado}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={indeterminado}
                      onChange={(e) => {
                        setIndeterminado(e.target.checked)
                        if (e.target.checked) handleChange('dataFim', '')
                      }}
                    />
                  }
                  label="Término indeterminado"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(value) => handleChange('status', value)}
                  margin="normal"
                  required
                  options={[
                    { value: 'ativo', label: 'Ativo' },
                    { value: 'inativo', label: 'Inativo' },
                  ]}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  multiline
                  rows={2}
                  value={form.descricao}
                  onChange={(e) => handleChange('descricao', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  multiline
                  rows={3}
                  value={form.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0 || loading}>
              Voltar
            </Button>
            {isLastStep ? (
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
              </Button>
            ) : (
              <Button type="submit" variant="contained" disabled={loading}>
                Próximo
              </Button>
            )}
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
