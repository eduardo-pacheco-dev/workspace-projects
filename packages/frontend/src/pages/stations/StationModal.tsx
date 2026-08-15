import { useState, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  CircularProgress,
  Grid,
} from '@mui/material'
import api from '../../services/api'
import StationFormField from '../../components/stations/StationFormField'
import { initialStationForm, stationFormFields, buildStationPayload, StationFormState } from './stationFormConfig'

interface StationModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: (record?: any) => void
}

export default function StationModal({ open, editId, onClose, onSaved }: StationModalProps) {
  const isEdit = Boolean(editId)
  const [form, setForm] = useState<StationFormState>(initialStationForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const saved = isEdit
        ? await api.patch(`/stations/${editId}`, buildStationPayload(form))
        : await api.post('/stations', buildStationPayload(form))
      onSaved(saved.data)
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setForm(initialStationForm)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Estação' : 'Nova Estação'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            {stationFormFields
              .filter((config) => config.visible?.(form) ?? true)
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
