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
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material'
import api from '../../services/api'

interface StationModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: (record?: any) => void
}

const mobileCarriers = ['TIM', 'CLARO', 'VIVO', 'Outras']

export default function StationModal({ open, editId, onClose, onSaved }: StationModalProps) {
  const isEdit = Boolean(editId)

  const [siteId, setSiteId] = useState('')
  const [endId, setEndId] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [mobileCarrier, setMobileCarrier] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('ativo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      api.get(`/stations/${editId}`)
        .then((res) => {
          const d = res.data
          setSiteId(d.siteId || '')
          setEndId(d.endId || '')
          setAddress(d.address || '')
          setLatitude(d.latitude != null ? String(d.latitude) : '')
          setLongitude(d.longitude != null ? String(d.longitude) : '')
          setMobileCarrier(d.mobileCarrier || '')
          setNotes(d.notes || '')
          setStatus(d.status || 'ativo')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const isTim = !mobileCarrier || mobileCarrier === 'TIM'
    const payload: any = { siteId, endId: isTim ? endId : '', address, mobileCarrier, notes, status }
    if (latitude) payload.latitude = Number(latitude)
    if (longitude) payload.longitude = Number(longitude)

    try {
      let saved: any
      if (isEdit) {
        saved = await api.patch(`/stations/${editId}`, payload)
      } else {
        saved = await api.post('/stations', payload)
      }
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
    setSiteId('')
    setEndId('')
    setAddress('')
    setLatitude('')
    setLongitude('')
    setMobileCarrier('')
    setNotes('')
    setStatus('ativo')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Estação' : 'Nova Estação'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Site ID" value={siteId} onChange={(e) => setSiteId(e.target.value)} margin="normal" required />
            </Grid>
            {(!mobileCarrier || mobileCarrier === 'TIM') && (
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="End ID" value={endId} onChange={(e) => setEndId(e.target.value)} margin="normal" required />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Operadora" value={mobileCarrier} onChange={(e) => setMobileCarrier(e.target.value)} margin="normal">
                <MenuItem value="">Selecione</MenuItem>
                {mobileCarriers.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} margin="normal" required>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Latitude" type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Longitude" type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Observações" multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} margin="normal" />
            </Grid>
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
