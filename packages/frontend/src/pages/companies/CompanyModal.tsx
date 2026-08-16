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
  FormControlLabel,
  Switch,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import TextField from '../../components/ui/TextField'
import SelectField from '../../components/ui/SelectField'
import Button from '../../components/ui/Button'
import DeleteModal from '../../components/modals/DeleteModal'
import { createCompanySchema, updateCompanySchema } from './companySchemas'
import { Company, ufOptions } from './companiesTypes'

interface CompanyModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface CompanyFormState {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  uf: string
  ativa: boolean
  observacoes: string
}

const initialForm: CompanyFormState = {
  nome: '',
  cnpj: '',
  email: '',
  telefone: '',
  endereco: '',
  cidade: '',
  uf: '',
  ativa: true,
  observacoes: '',
}

const STEPS = [{ label: 'Identificação' }, { label: 'Contato e Endereço' }, { label: 'Finalização' }]

export default function CompanyModal({ open, editId, onClose, onSaved }: CompanyModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()
  const [form, setForm] = useState<CompanyFormState>(initialForm)
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
          .get(`/companies/${editId}`)
          .then((res) => {
            const d: Company = res.data
            setForm({
              nome: d.nome,
              cnpj: d.cnpj || '',
              email: d.email || '',
              telefone: d.telefone || '',
              endereco: d.endereco || '',
              cidade: d.cidade || '',
              uf: d.uf || '',
              ativa: d.ativa,
              observacoes: d.observacoes || '',
            })
          })
          .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
          .finally(() => setLoading(false))
      }
    }
  }, [open, editId])

  const handleChange = (key: keyof CompanyFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validateStep = () => {
    const missing: string[] = []
    if (activeStep === 0 && !form.nome.trim()) missing.push('Nome')

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
      nome: form.nome,
      cnpj: form.cnpj || undefined,
      email: form.email || undefined,
      telefone: form.telefone || undefined,
      endereco: form.endereco || undefined,
      cidade: form.cidade || undefined,
      uf: form.uf || undefined,
      ativa: form.ativa,
      observacoes: form.observacoes || undefined,
    }

    const schema = isEdit ? updateCompanySchema : createCompanySchema
    const result = schema.safeParse(payload)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/companies/${editId}`, payload)
      } else {
        await api.post('/companies', payload)
      }
      showToast(isEdit ? 'Empresa atualizada com sucesso.' : 'Empresa criada com sucesso.')
      onSaved()
      handleClose()
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
      await api.delete(`/companies/${editId}`)
      showToast('Empresa excluída com sucesso.')
      onSaved()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (loading || deleting) return
    setError('')
    setStepError('')
    setFieldErrors({})
    setForm(initialForm)
    setConfirmDelete(false)
    setActiveStep(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
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
                  value={form.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  margin="normal"
                  required
                  autoFocus
                  error={!!fieldErrors.nome}
                  helperText={fieldErrors.nome}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CNPJ"
                  value={form.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  margin="normal"
                  error={!!fieldErrors.cnpj}
                  helperText={fieldErrors.cnpj}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone"
                  value={form.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  margin="normal"
                  error={!!fieldErrors.telefone}
                  helperText={fieldErrors.telefone}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  margin="normal"
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Endereço"
                  value={form.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  margin="normal"
                  error={!!fieldErrors.endereco}
                  helperText={fieldErrors.endereco}
                />
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  label="Cidade"
                  value={form.cidade}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                  margin="normal"
                  error={!!fieldErrors.cidade}
                  helperText={fieldErrors.cidade}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <SelectField
                  label="UF"
                  value={form.uf}
                  onChange={(value) => handleChange('uf', value)}
                  margin="normal"
                  error={!!fieldErrors.uf}
                  helperText={fieldErrors.uf}
                  allowEmpty
                  emptyLabel="-"
                  options={ufOptions.map((item) => ({ value: item, label: item }))}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <>
              <FormControlLabel
                control={<Switch checked={form.ativa} onChange={(e) => handleChange('ativa', e.target.checked)} />}
                label={form.ativa ? 'Empresa ativa' : 'Empresa inativa'}
                sx={{ mt: 1 }}
              />
              <TextField
                label="Observações"
                multiline
                rows={3}
                value={form.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                margin="normal"
                error={!!fieldErrors.observacoes}
                helperText={fieldErrors.observacoes}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isEdit && (
              <Tooltip title="Excluir empresa">
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
        title="Excluir empresa"
        message="Tem certeza que deseja excluir esta empresa? Esta ação não poderá ser desfeita."
        deleting={deleting}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
