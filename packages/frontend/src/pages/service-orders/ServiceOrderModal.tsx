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
  MenuItem,
  Grid,
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'

const operadoraOptions = ['TIM', 'CLARO', 'VIVO', 'Outras']

const baseSchema = z.object({
  cliente: z.string().min(1, 'Informe o cliente.'),
  descricao: z.string().optional(),
  siteId: z.string().optional(),
  endId: z.string().optional(),
  operadora: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  observacoes: z.string().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface ServiceOrderModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function ServiceOrderModal({ open, editId, onClose, onSaved }: ServiceOrderModalProps) {
  const isEdit = Boolean(editId)

  const [numero, setNumero] = useState('')
  const [cliente, setCliente] = useState('')
  const [descricao, setDescricao] = useState('')
  const [siteId, setSiteId] = useState('')
  const [endId, setEndId] = useState('')
  const [operadora, setOperadora] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState('aberta')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/service-orders/${editId}`)
        .then((res) => {
          const d = res.data
          setNumero(d.numero || '')
          setCliente(d.cliente || '')
          setDescricao(d.descricao || '')
          setSiteId(d.siteId || '')
          setEndId(d.endId || '')
          setOperadora(d.operadora || '')
          setDataInicio(d.dataInicio || '')
          setDataFim(d.dataFim || '')
          setStatus(d.status || 'aberta')
          setObservacoes(d.observacoes || '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const getFieldErrors = (error: z.ZodError) =>
    Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const formData = {
      cliente,
      descricao,
      siteId,
      endId,
      operadora,
      dataInicio,
      dataFim,
      observacoes,
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(formData)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = {
      cliente,
      descricao,
      siteId,
      endId,
      operadora,
      dataInicio,
      dataFim,
      observacoes,
    }
    if (isEdit) payload.status = status

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/service-orders/${editId}`, payload)
      } else {
        await api.post('/service-orders', payload)
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
    setNumero('')
    setCliente('')
    setDescricao('')
    setSiteId('')
    setEndId('')
    setOperadora('')
    setDataInicio('')
    setDataFim('')
    setStatus('aberta')
    setObservacoes('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {isEdit && (
            <TextField fullWidth label="Número da OS" value={numero} margin="normal" disabled />
          )}
          <TextField
            fullWidth
            label="Cliente"
            value={cliente}
            onChange={(e) => {
              setCliente(e.target.value)
              clearFieldError('cliente')
            }}
            margin="normal"
            required
            error={!!fieldErrors.cliente}
            helperText={fieldErrors.cliente}
          />
          <TextField
            fullWidth
            label="Descrição"
            multiline
            rows={3}
            value={descricao}
            onChange={(e) => {
              setDescricao(e.target.value)
              clearFieldError('descricao')
            }}
            margin="normal"
            error={!!fieldErrors.descricao}
            helperText={fieldErrors.descricao}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Site ID"
                value={siteId}
                onChange={(e) => {
                  setSiteId(e.target.value)
                  clearFieldError('siteId')
                }}
                margin="normal"
                error={!!fieldErrors.siteId}
                helperText={fieldErrors.siteId}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End ID"
                value={endId}
                onChange={(e) => {
                  setEndId(e.target.value)
                  clearFieldError('endId')
                }}
                margin="normal"
                error={!!fieldErrors.endId}
                helperText={fieldErrors.endId}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Operadora"
                value={operadora}
                onChange={(e) => {
                  setOperadora(e.target.value)
                  clearFieldError('operadora')
                }}
                margin="normal"
                error={!!fieldErrors.operadora}
                helperText={fieldErrors.operadora}
              >
                <MenuItem value="">Selecione</MenuItem>
                {operadoraOptions.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de Início"
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value)
                  clearFieldError('dataInicio')
                }}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!fieldErrors.dataInicio}
                helperText={fieldErrors.dataInicio}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de Fim"
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value)
                  clearFieldError('dataFim')
                }}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!fieldErrors.dataFim}
                helperText={fieldErrors.dataFim}
              />
            </Grid>
          </Grid>
          {isEdit && (
            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              margin="normal"
            >
              <MenuItem value="aberta">Aberta</MenuItem>
              <MenuItem value="em_andamento">Em andamento</MenuItem>
              <MenuItem value="concluida">Concluída</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
            </TextField>
          )}
          <TextField
            fullWidth
            label="Observações"
            multiline
            rows={2}
            value={observacoes}
            onChange={(e) => {
              setObservacoes(e.target.value)
              clearFieldError('observacoes')
            }}
            margin="normal"
            error={!!fieldErrors.observacoes}
            helperText={fieldErrors.observacoes}
          />
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
