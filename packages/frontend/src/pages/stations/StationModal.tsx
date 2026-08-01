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
  onSaved: () => void
}

export default function StationModal({ open, editId, onClose, onSaved }: StationModalProps) {
  const isEdit = Boolean(editId)

  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [endereco, setEndereco] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [tecnologia, setTecnologia] = useState('')
  const [operadora, setOperadora] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [status, setStatus] = useState('ativo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      api.get(`/stations/${editId}`)
        .then((res) => {
          const d = res.data
          setNome(d.nome || '')
          setCodigo(d.codigo || '')
          setEndereco(d.endereco || '')
          setLatitude(d.latitude != null ? String(d.latitude) : '')
          setLongitude(d.longitude != null ? String(d.longitude) : '')
          setTecnologia(d.tecnologia || '')
          setOperadora(d.operadora || '')
          setObservacoes(d.observacoes || '')
          setStatus(d.status || 'ativo')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload: any = { nome, codigo, endereco, tecnologia, operadora, observacoes, status }
    if (latitude) payload.latitude = Number(latitude)
    if (longitude) payload.longitude = Number(longitude)

    try {
      if (isEdit) {
        await api.patch(`/stations/${editId}`, payload)
      } else {
        await api.post('/stations', payload)
      }
      onSaved()
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
    setNome('')
    setCodigo('')
    setEndereco('')
    setLatitude('')
    setLongitude('')
    setTecnologia('')
    setOperadora('')
    setObservacoes('')
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
            <Grid item xs={12}>
              <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Operadora" value={operadora} onChange={(e) => setOperadora(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Latitude" type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Longitude" type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tecnologia" value={tecnologia} onChange={(e) => setTecnologia(e.target.value)} margin="normal" placeholder="Ex.: 4G, 5G" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} margin="normal" required>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Observações" multiline rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} margin="normal" />
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
