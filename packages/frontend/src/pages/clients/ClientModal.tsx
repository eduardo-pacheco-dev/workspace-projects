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

interface ClientModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function ClientModal({ open, editId, onClose, onSaved }: ClientModalProps) {
  const isEdit = Boolean(editId)

  const [nome, setNome] = useState('')
  const [documento, setDocumento] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [status, setStatus] = useState('ativo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      api.get(`/clients/${editId}`)
        .then((res) => {
          const d = res.data
          setNome(d.nome || '')
          setDocumento(d.documento || '')
          setEmail(d.email || '')
          setTelefone(d.telefone || '')
          setEndereco(d.endereco || '')
          setCidade(d.cidade || '')
          setUf(d.uf || '')
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

    const payload: any = { nome, documento, email, telefone, endereco, cidade, uf, observacoes, status }

    try {
      if (isEdit) {
        await api.patch(`/clients/${editId}`, payload)
      } else {
        await api.post('/clients', payload)
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
    setDocumento('')
    setEmail('')
    setTelefone('')
    setEndereco('')
    setCidade('')
    setUf('')
    setObservacoes('')
    setStatus('ativo')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="CNPJ" value={documento} onChange={(e) => setDocumento(e.target.value)} margin="normal" placeholder="CNPJ" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="UF" value={uf} onChange={(e) => setUf(e.target.value)} margin="normal" inputProps={{ maxLength: 2 }} />
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
