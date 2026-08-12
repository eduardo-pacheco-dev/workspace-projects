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
  const [elementType, setElementType] = useState('')
  const [technology, setTechnology] = useState('')
  const [areaHolder, setAreaHolder] = useState('')
  const [infraContractType, setInfraContractType] = useState('')
  const [infraHolder, setInfraHolder] = useState('')
  const [infraType, setInfraType] = useState('')
  const [evType, setEvType] = useState('')
  const [evSupplier, setEvSupplier] = useState('')
  const [address, setAddress] = useState('')
  const [regional, setRegional] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [mobileCarrier, setMobileCarrier] = useState('')
  const [towerType, setTowerType] = useState('')
  const [nominalAev, setNominalAev] = useState('')
  const [groundArea, setGroundArea] = useState('')
  const [structureHeight, setStructureHeight] = useState('')
  const [stationId, setStationId] = useState('')
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
          setElementType(d.elementType || '')
          setTechnology(d.technology || '')
          setAreaHolder(d.areaHolder || '')
          setInfraContractType(d.infraContractType || '')
          setInfraHolder(d.infraHolder || '')
          setInfraType(d.infraType || '')
          setEvType(d.evType || '')
          setEvSupplier(d.evSupplier || '')
          setAddress(d.address || '')
          setRegional(d.regional || '')
          setLatitude(d.latitude != null ? String(d.latitude) : '')
          setLongitude(d.longitude != null ? String(d.longitude) : '')
          setMobileCarrier(d.mobileCarrier || '')
          setTowerType(d.towerType || '')
          setNominalAev(d.nominalAev != null ? String(d.nominalAev) : '')
          setGroundArea(d.groundArea != null ? String(d.groundArea) : '')
          setStructureHeight(d.structureHeight != null ? String(d.structureHeight) : '')
          setStationId(d.stationId || '')
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
    const payload: any = {
      siteId,
      endId: isTim ? endId : '',
      elementType,
      technology,
      areaHolder,
      infraContractType,
      infraHolder,
      infraType,
      evType,
      evSupplier,
      address,
      regional,
      mobileCarrier,
      towerType,
      stationId,
      notes,
      status,
    }
    if (latitude) payload.latitude = Number(latitude)
    if (longitude) payload.longitude = Number(longitude)
    if (nominalAev) payload.nominalAev = Number(nominalAev)
    if (groundArea) payload.groundArea = Number(groundArea)
    if (structureHeight) payload.structureHeight = Number(structureHeight)

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
    setElementType('')
    setTechnology('')
    setAreaHolder('')
    setInfraContractType('')
    setInfraHolder('')
    setInfraType('')
    setEvType('')
    setEvSupplier('')
    setAddress('')
    setRegional('')
    setLatitude('')
    setLongitude('')
    setMobileCarrier('')
    setTowerType('')
    setNominalAev('')
    setGroundArea('')
    setStructureHeight('')
    setStationId('')
    setNotes('')
    setStatus('ativo')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
              <TextField fullWidth label="Tipo de elemento" value={elementType} onChange={(e) => setElementType(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tecnologia" value={technology} onChange={(e) => setTechnology(e.target.value)} margin="normal" />
            </Grid>
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
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Detentor da Área" value={areaHolder} onChange={(e) => setAreaHolder(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Detentor de Infra" value={infraHolder} onChange={(e) => setInfraHolder(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tipo de contrato Infra" value={infraContractType} onChange={(e) => setInfraContractType(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tipo de Infra" value={infraType} onChange={(e) => setInfraType(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tipo de EV" value={evType} onChange={(e) => setEvType(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Fornecedor de EV" value={evSupplier} onChange={(e) => setEvSupplier(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Regional" value={regional} onChange={(e) => setRegional(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tipo da torre" value={towerType} onChange={(e) => setTowerType(e.target.value)} margin="normal" />
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
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="AEV Nominal" type="number" value={nominalAev} onChange={(e) => setNominalAev(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Área de solo" type="number" value={groundArea} onChange={(e) => setGroundArea(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Altura da estrutura" type="number" value={structureHeight} onChange={(e) => setStructureHeight(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Station ID (id da detentora)" value={stationId} onChange={(e) => setStationId(e.target.value)} margin="normal" />
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
