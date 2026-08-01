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
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import api from '../../services/api'

interface ProjectModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function ProjectModal({ open, editId, onClose, onSaved }: ProjectModalProps) {
  const isEdit = Boolean(editId)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cliente, setCliente] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [indeterminado, setIndeterminado] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [status, setStatus] = useState('ativo')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      api.get(`/projects/${editId}`)
        .then((res) => {
          const d = res.data
          setNome(d.nome || '')
          setDescricao(d.descricao || '')
          setCliente(d.cliente || '')
          setDataInicio(d.dataInicio || '')
          setDataFim(d.dataFim || '')
          setIndeterminado(!d.dataFim)
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

    const payload: any = { nome, descricao, cliente, dataInicio, observacoes, status }
    payload.dataFim = indeterminado ? '' : dataFim

    try {
      if (isEdit) {
        await api.patch(`/projects/${editId}`, payload)
      } else {
        await api.post('/projects', payload)
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
    setCliente('')
    setDataInicio('')
    setDataFim('')
    setIndeterminado(false)
    setObservacoes('')
    setStatus('ativo')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Data de Início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de Término"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                margin="normal"
                disabled={indeterminado}
                InputLabelProps={{ shrink: true }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={indeterminado}
                    onChange={(e) => {
                      setIndeterminado(e.target.checked)
                      if (e.target.checked) setDataFim('')
                    }}
                  />
                }
                label="Término indeterminado"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Descrição" multiline rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} margin="normal" />
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
