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
} from '@mui/material'
import api from '../../services/api'

interface FreelancerOption {
  id: number
  firstName: string
  lastName: string
}

interface LpuModalProps {
  open: boolean
  editId?: number | null
  freelancerId?: number | null
  freelancers?: FreelancerOption[]
  onClose: () => void
  onSaved: () => void
}

export default function LpuModal({
  open,
  editId,
  freelancerId,
  freelancers = [],
  onClose,
  onSaved,
}: LpuModalProps) {
  const isEdit = Boolean(editId)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [status, setStatus] = useState('ativo')
  const [selectedFreelancer, setSelectedFreelancer] = useState<number | ''>(freelancerId ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setSelectedFreelancer(freelancerId ?? '')
  }, [open, freelancerId])

  useEffect(() => {
    if (open && editId) {
      api.get(`/lpus/${editId}`)
        .then((res) => {
          const d = res.data
          setNome(d.nome || '')
          setDescricao(d.descricao || '')
          setValor(d.valor ? String(d.valor) : '')
          setData(d.data || '')
          setStatus(d.status || 'ativo')
          setSelectedFreelancer(d.freelancerId ?? '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isEdit && !selectedFreelancer) {
      setError('Selecione o freelancer.')
      return
    }
    setLoading(true)

    const payload: any = { nome, descricao, data, status }
    if (valor) payload.valor = Number(valor)
    if (!isEdit) payload.freelancerId = Number(selectedFreelancer)

    try {
      if (isEdit) {
        await api.patch(`/lpus/${editId}`, payload)
      } else {
        await api.post('/lpus', payload)
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
    setDescricao('')
    setValor('')
    setData('')
    setStatus('ativo')
    setSelectedFreelancer(freelancerId ?? '')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar LPU' : 'Nova LPU'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!isEdit && (
            <TextField
              fullWidth
              select
              label="Freelancer"
              value={selectedFreelancer}
              onChange={(e) => setSelectedFreelancer(e.target.value ? Number(e.target.value) : '')}
              margin="normal"
              required
            >
              <MenuItem value="">Selecione um freelancer</MenuItem>
              {freelancers.map((f) => (
                <MenuItem key={f.id} value={f.id}>{f.firstName} {f.lastName}</MenuItem>
              ))}
            </TextField>
          )}
          <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Descrição" multiline rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} margin="normal" />
          <TextField fullWidth label="Valor" type="number" value={valor} onChange={(e) => setValor(e.target.value)} margin="normal" />
          <TextField fullWidth label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} margin="normal" required>
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
          </TextField>
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
