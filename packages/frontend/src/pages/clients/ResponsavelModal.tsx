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
  CircularProgress,
  Grid,
} from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { formatPhone } from '../../utils/phone'

export interface Responsavel {
  id: number
  clientId: number
  nome: string
  sobrenome: string
  email: string | null
  telefone: string | null
  funcao: string | null
}

interface ResponsavelModalProps {
  open: boolean
  clientId: number
  editData?: Responsavel | null
  onClose: () => void
  onSaved: () => void
}

export default function ResponsavelModal({ open, clientId, editData, onClose, onSaved }: ResponsavelModalProps) {
  const isEdit = Boolean(editData)
  const { showToast } = useToast()

  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [funcao, setFuncao] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setNome(editData?.nome || '')
      setSobrenome(editData?.sobrenome || '')
      setEmail(editData?.email || '')
      setTelefone(editData?.telefone ? formatPhone(editData.telefone) : '')
      setFuncao(editData?.funcao || '')
    }
  }, [open, editData])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload: any = { nome, sobrenome, email, telefone, funcao }

    try {
      if (isEdit) {
        await api.patch(`/clients/responsaveis/${editData?.id}`, payload)
      } else {
        await api.post(`/clients/${clientId}/responsaveis`, payload)
      }
      showToast(isEdit ? 'Responsável atualizado com sucesso.' : 'Responsável criado com sucesso.')
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
    setSobrenome('')
    setEmail('')
    setTelefone('')
    setFuncao('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Responsável' : 'Novo Responsável'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} margin="normal" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} margin="normal" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                margin="normal"
                placeholder="(00) 00000-0000"
                inputProps={{ maxLength: 15 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Função" value={funcao} onChange={(e) => setFuncao(e.target.value)} margin="normal" placeholder="Ex.: Diretor de TI" />
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
