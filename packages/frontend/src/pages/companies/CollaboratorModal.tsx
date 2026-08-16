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
  FormControlLabel,
  Switch,
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import TextField from '../../components/ui/TextField'
import Button from '../../components/ui/Button'
import { CompanyCollaborator } from './companiesTypes'

const baseSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  cargo: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional().or(z.literal('')),
  telefone: z.string().optional(),
  ativo: z.boolean().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface CollaboratorModalProps {
  open: boolean
  companyId: number
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

const STEPS = [{ label: 'Identificação' }, { label: 'Contato' }]

export default function CollaboratorModal({ open, companyId, editId, onClose, onSaved }: CollaboratorModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()

  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [ativo, setAtivo] = useState(true)
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
        setLoading(true)
        api
          .get(`/companies/${companyId}/collaborators/${editId}`)
          .then((res) => {
            const d: CompanyCollaborator = res.data
            setNome(d.nome)
            setCargo(d.cargo || '')
            setEmail(d.email || '')
            setTelefone(d.telefone || '')
            setAtivo(d.ativo)
          })
          .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
          .finally(() => setLoading(false))
      }
    }
  }, [open, editId, companyId])

  const reset = () => {
    setNome('')
    setCargo('')
    setEmail('')
    setTelefone('')
    setAtivo(true)
    setError('')
    setStepError('')
    setFieldErrors({})
    setActiveStep(0)
  }

  const getFieldErrors = (error: z.ZodError) =>
    Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const validateStep = () => {
    const missing: string[] = []
    if (activeStep === 0 && !nome.trim()) missing.push('Nome')

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

    const payload = {
      nome,
      cargo: cargo || undefined,
      email: email || undefined,
      telefone: telefone || undefined,
      ativo,
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
        await api.patch(`/companies/${companyId}/collaborators/${editId}`, payload)
      } else {
        await api.post(`/companies/${companyId}/collaborators`, payload)
      }
      showToast(isEdit ? 'Colaborador atualizado com sucesso.' : 'Colaborador criado com sucesso.')
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
        <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
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
              <Grid item xs={12}>
                <TextField
                  label="Nome"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    clearFieldError('nome')
                  }}
                  margin="normal"
                  required
                  autoFocus
                  error={!!fieldErrors.nome}
                  helperText={fieldErrors.nome}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Cargo"
                  value={cargo}
                  onChange={(e) => {
                    setCargo(e.target.value)
                    clearFieldError('cargo')
                  }}
                  margin="normal"
                  error={!!fieldErrors.cargo}
                  helperText={fieldErrors.cargo}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError('email')
                  }}
                  margin="normal"
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone"
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(e.target.value)
                    clearFieldError('telefone')
                  }}
                  margin="normal"
                  error={!!fieldErrors.telefone}
                  helperText={fieldErrors.telefone}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />}
                  label={ativo ? 'Colaborador ativo' : 'Colaborador inativo'}
                  sx={{ mt: 1 }}
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
