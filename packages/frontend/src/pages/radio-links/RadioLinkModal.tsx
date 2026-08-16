import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  CircularProgress,
  Grid,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import TextField from '../../components/ui/TextField'
import SelectField from '../../components/ui/SelectField'
import Button from '../../components/ui/Button'
import { normalizeList } from '../../utils/list'
import StationModal from '../stations/StationModal'
import LinkEndpointPicker from '../../components/radio-links/LinkEndpointPicker'
import { LinkStationOption } from './radioLinksTypes'

interface RadioLinkModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

const STEPS = [{ label: 'Identificação' }, { label: 'Extremidades' }, { label: 'Detalhes' }]

export default function RadioLinkModal({ open, editId, onClose, onSaved }: RadioLinkModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()

  const [nome, setNome] = useState('')
  const [frequencia, setFrequencia] = useState('')
  const [capacidade, setCapacidade] = useState('')
  const [stations, setStations] = useState<LinkStationOption[]>([])
  const [stationA, setStationA] = useState<LinkStationOption | null>(null)
  const [stationB, setStationB] = useState<LinkStationOption | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [status, setStatus] = useState('ativo')
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [newStationEnd, setNewStationEnd] = useState<'A' | 'B' | null>(null)

  const isLastStep = activeStep === STEPS.length - 1

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations', { params: { limit: 1000, sortBy: 'siteId', sortOrder: 'ASC' } })
      const data = normalizeList<LinkStationOption>(res.data).data
      setStations(data)
      return data
    } catch {
      return []
    }
  }

  useEffect(() => {
    if (open) {
      setActiveStep(0)
      setStepError('')
      fetchStations().then(async (data) => {
        if (editId) {
          try {
            const res = await api.get(`/radio-links/${editId}`)
            const d = res.data
            setNome(d.nome || '')
            setFrequencia(d.frequencia || '')
            setCapacidade(d.capacidade || '')
            setObservacoes(d.observacoes || '')
            setStatus(d.status || 'ativo')
            setStationA(data.find((s) => s.id === d.stationAId) || null)
            setStationB(data.find((s) => s.id === d.stationBId) || null)
          } catch (err: any) {
            setError(err.response?.data?.message || 'Não foi possível carregar os dados.')
          }
        }
      })
    }
  }, [open, editId])

  const validateStep = () => {
    const missing: string[] = []
    if (activeStep === 0) {
      if (!nome.trim()) missing.push('Nome')
      if (!status) missing.push('Status')
    } else if (activeStep === 1) {
      if (!stationA) missing.push('Estação A')
      if (!stationB) missing.push('Estação B')
    }

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

  const handleSubmit = async () => {
    if (!validateStep()) return
    setError('')
    setLoading(true)

    const payload: any = { nome, frequencia, capacidade, observacoes, status }
    if (stationA) payload.stationAId = stationA.id
    if (stationB) payload.stationBId = stationB.id

    try {
      if (isEdit) {
        await api.patch(`/radio-links/${editId}`, payload)
      } else {
        await api.post('/radio-links', payload)
      }
      showToast(isEdit ? 'Enlace de rádio atualizado com sucesso.' : 'Enlace de rádio criado com sucesso.')
      onSaved()
      handleClose()
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível salvar. Tente novamente.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setStepError('')
    setActiveStep(0)
    setNome('')
    setFrequencia('')
    setCapacidade('')
    setStationA(null)
    setStationB(null)
    setObservacoes('')
    setStatus('ativo')
    setNewStationEnd(null)
    onClose()
  }

  const handleStationCreated = async (record?: any) => {
    const data = await fetchStations()
    const created = data.find((s) => s.id === record?.id)
    if (created) {
      if (newStationEnd === 'A') setStationA(created)
      else if (newStationEnd === 'B') setStationB(created)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Editar Enlace de Rádio' : 'Novo Enlace de Rádio'}</DialogTitle>
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
              <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Frequência" value={frequencia} onChange={(e) => setFrequencia(e.target.value)} margin="normal" placeholder="Ex.: 5.8 GHz" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Capacidade" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} margin="normal" placeholder="Ex.: 300 Mbps" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SelectField
                label="Status"
                value={status}
                onChange={setStatus}
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

        {activeStep === 1 && (
          <>
            <LinkEndpointPicker
              label="Estação A"
              stations={stations}
              value={stationA}
              onChange={setStationA}
              onNewStation={() => setNewStationEnd('A')}
            />
            <Divider sx={{ my: 2 }} />
            <LinkEndpointPicker
              label="Estação B"
              stations={stations}
              value={stationB}
              onChange={setStationB}
              onNewStation={() => setNewStationEnd('B')}
            />
          </>
        )}

        {activeStep === 2 && (
          <TextField
            label="Observações"
            multiline
            rows={4}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            margin="normal"
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0 || loading}>
            Voltar
          </Button>
          {isLastStep ? (
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} disabled={loading}>
              Próximo
            </Button>
          )}
        </Box>
      </DialogActions>

      <StationModal
        open={newStationEnd !== null}
        onClose={() => setNewStationEnd(null)}
        onSaved={handleStationCreated}
      />
    </Dialog>
  )
}
