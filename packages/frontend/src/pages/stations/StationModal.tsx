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
} from '@mui/material'
import api from '../../services/api'
import StationFormField from '../../components/stations/StationFormField'
import Button from '../../components/ui/Button'
import { useToast } from '../../contexts/ToastContext'
import {
  initialStationForm,
  stationFormFields,
  stationFormSteps,
  buildStationPayload,
  StationFormState,
} from './stationFormConfig'

interface StationModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: (record?: any) => void
}

export default function StationModal({ open, editId, onClose, onSaved }: StationModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()
  const [form, setForm] = useState<StationFormState>(initialStationForm)
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const stepFields = stationFormSteps[activeStep].fields
  const isLastStep = activeStep === stationFormSteps.length - 1

  useEffect(() => {
    if (open && editId) {
      api.get(`/stations/${editId}`)
        .then((res) => {
          const data = res.data
          setForm({
            siteId: data.siteId || '',
            endId: data.endId || '',
            elementType: data.elementType || '',
            technology: data.technology || '',
            areaHolder: data.areaHolder || '',
            infraContractType: data.infraContractType || '',
            infraHolder: data.infraHolder || '',
            infraType: data.infraType || '',
            evType: data.evType || '',
            evSupplier: data.evSupplier || '',
            address: data.address || '',
            regional: data.regional || '',
            latitude: data.latitude != null ? String(data.latitude) : '',
            longitude: data.longitude != null ? String(data.longitude) : '',
            mobileCarrier: data.mobileCarrier || '',
            towerType: data.towerType || '',
            nominalAev: data.nominalAev != null ? String(data.nominalAev) : '',
            groundArea: data.groundArea != null ? String(data.groundArea) : '',
            structureHeight: data.structureHeight != null ? String(data.structureHeight) : '',
            stationId: data.stationId || '',
            notes: data.notes || '',
            status: data.status || 'ativo',
          })
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

  useEffect(() => {
    if (open) {
      setActiveStep(0)
      setStepError('')
    }
  }, [open])

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateStep = () => {
    const missing = stationFormFields
      .filter(
        (config) =>
          stepFields.includes(config.name) &&
          config.required &&
          !String(form[config.name as keyof StationFormState]).trim()
      )
      .map((config) => config.label)

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
    setLoading(true)

    try {
      const saved = isEdit
        ? await api.patch(`/stations/${editId}`, buildStationPayload(form))
        : await api.post('/stations', buildStationPayload(form))
      onSaved(saved.data)
      handleClose()
      showToast(isEdit ? 'Estação atualizada com sucesso.' : 'Estação criada com sucesso.')
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
    setActiveStep(0)
    setForm(initialStationForm)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Estação' : 'Nova Estação'}</DialogTitle>
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
            {stationFormSteps.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            Passo {activeStep + 1} de {stationFormSteps.length} — {stationFormSteps[activeStep].label}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {stepError && <Alert severity="warning" sx={{ mb: 2 }}>{stepError}</Alert>}

          <Grid container spacing={2}>
            {stationFormFields
              .filter((config) => stepFields.includes(config.name) && (config.visible?.(form) ?? true))
              .map((config) => (
                <Grid item xs={12} sm={config.size ?? 12} key={config.name}>
                  <StationFormField
                    config={config}
                    value={form[config.name as keyof StationFormState]}
                    onChange={(value) => handleChange(config.name, value)}
                  />
                </Grid>
              ))}
          </Grid>
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
