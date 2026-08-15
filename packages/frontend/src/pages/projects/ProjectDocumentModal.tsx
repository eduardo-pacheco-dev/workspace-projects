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
import { getFieldErrors } from '../../schemas/authSchemas'
import { projectDocumentSchema } from './projectSchemas'

interface ProjectDocumentModalProps {
  open: boolean
  projectId: number
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

const documentTypes = ['Contrato', 'Licença', 'Laudo', 'Relatório', 'Projeto', 'Foto', 'Outro']

export default function ProjectDocumentModal({
  open,
  projectId,
  editId,
  onClose,
  onSaved,
}: ProjectDocumentModalProps) {
  const isEdit = Boolean(editId)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      api.get(`/projects/${projectId}/documents`)
        .then((res) => {
          const d = (res.data ?? []).find((item: any) => item.id === editId)
          if (d) {
            setNome(d.nome || '')
            setTipo(d.tipo || '')
            setQuantidade(d.quantidade != null ? String(d.quantidade) : '1')
            setObservacoes(d.observacoes || '')
          }
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId, projectId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = projectDocumentSchema.safeParse({ nome, tipo, quantidade, observacoes })
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = { nome, tipo, observacoes }
    if (quantidade) payload.quantidade = Number(quantidade)

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/projects/${projectId}/documents/${editId}`, payload)
      } else {
        await api.post(`/projects/${projectId}/documents`, payload)
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
    setFieldErrors({})
    setNome('')
    setTipo('')
    setQuantidade('1')
    setObservacoes('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                label="Documento"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, nome: '' }))
                }}
                margin="normal"
                required
                placeholder="Ex.: Contrato assinado"
                error={!!fieldErrors.nome}
                helperText={fieldErrors.nome}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField fullWidth select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} margin="normal">
                <MenuItem value="">Selecione</MenuItem>
                {documentTypes.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                margin="normal"
                inputProps={{ min: 1 }}
                error={!!fieldErrors.quantidade}
                helperText={fieldErrors.quantidade}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} margin="normal" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Adicionar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
