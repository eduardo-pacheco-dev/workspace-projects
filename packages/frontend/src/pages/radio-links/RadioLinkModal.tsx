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
  Typography,
  Divider,
  Autocomplete,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import StationModal from '../stations/StationModal'

interface RadioLinkModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface Station {
  id: number
  siteId: string
  endId: string
  mobileCarrier: string | null
}

export default function RadioLinkModal({ open, editId, onClose, onSaved }: RadioLinkModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()

  const [nome, setNome] = useState('')
  const [frequencia, setFrequencia] = useState('')
  const [capacidade, setCapacidade] = useState('')
  const [stations, setStations] = useState<Station[]>([])
  const [stationA, setStationA] = useState<Station | null>(null)
  const [stationB, setStationB] = useState<Station | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [status, setStatus] = useState('ativo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newStationEnd, setNewStationEnd] = useState<'A' | 'B' | null>(null)

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations', { params: { limit: 1000, sortBy: 'siteId', sortOrder: 'ASC' } })
      const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
      setStations(data)
      return data as Station[]
    } catch {
      return []
    }
  }

  useEffect(() => {
    if (open) {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
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
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
      showToast(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setNome('')
    setFrequencia('')
    setCapacidade('')
    setStationA(null)
    setStationB(null)
    setObservacoes('')
    setStatus('ativo')
    onClose()
  }

  const stationLabel = (s: Station) =>
    `${s.siteId} · ${s.endId}${s.mobileCarrier ? ` (${s.mobileCarrier})` : ''}`

  const renderEnd = (label: string, end: 'A' | 'B', value: Station | null, setValue: (s: Station | null) => void) => (
    <Grid item xs={12}>
      <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>{label}</Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Autocomplete
          fullWidth
          options={stations}
          getOptionLabel={stationLabel}
          value={value}
          onChange={(_, v) => setValue(v)}
          renderInput={(params) => (
            <TextField {...params} label="Selecionar estação" placeholder="Busque pelo site id ou end id" />
          )}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setNewStationEnd(end)}
          sx={{ height: 56, whiteSpace: 'nowrap' }}
        >
          Nova Estação
        </Button>
      </Box>
    </Grid>
  )

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Enlace de Rádio' : 'Novo Enlace de Rádio'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Frequência" value={frequencia} onChange={(e) => setFrequencia(e.target.value)} margin="normal" placeholder="Ex.: 5.8 GHz" />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Capacidade" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} margin="normal" placeholder="Ex.: 300 Mbps" />
            </Grid>
          </Grid>
          <Divider sx={{ my: 1 }} />
          {renderEnd('Estação A', 'A', stationA, setStationA)}
          <Divider sx={{ my: 1 }} />
          {renderEnd('Estação B', 'B', stationB, setStationB)}
          <Grid container spacing={2}>
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

      <StationModal
        open={newStationEnd !== null}
        onClose={() => setNewStationEnd(null)}
        onSaved={(record) => {
          fetchStations().then((data) => {
            const created = data.find((s) => s.id === record?.id)
            if (created) {
              if (newStationEnd === 'A') setStationA(created)
              else if (newStationEnd === 'B') setStationB(created)
            }
          })
        }}
      />
    </Dialog>
  )
}
