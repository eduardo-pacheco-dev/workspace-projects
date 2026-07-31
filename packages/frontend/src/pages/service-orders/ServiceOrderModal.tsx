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
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'

const baseSchema = z.object({
  numero: z.string().min(1, 'Informe o número da OS.'),
  cliente: z.string().min(1, 'Informe o cliente.'),
  descricao: z.string().min(1, 'Informe a descrição.'),
  endereco: z.string().optional(),
  data: z.string().optional(),
  valor: z.string().optional(),
  observacoes: z.string().optional(),
})

const createSchema = baseSchema.refine(
  (data) => data.valor === '' || !isNaN(Number(data.valor)),
  { message: 'Valor inválido.', path: ['valor'] },
)

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
  const [endereco, setEndereco] = useState('')
  const [data, setData] = useState('')
  const [valor, setValor] = useState('')
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
          setEndereco(d.endereco || '')
          setData(d.data || '')
          setValor(d.valor != null ? String(d.valor) : '')
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
      numero,
      cliente,
      descricao,
      endereco,
      data,
      valor,
      observacoes,
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(formData)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = {
      numero,
      cliente,
      descricao,
      endereco,
      data,
      observacoes,
    }
    if (valor !== '') payload.valor = Number(valor)
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
    setEndereco('')
    setData('')
    setValor('')
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
          <TextField
            fullWidth
            label="Número da OS"
            value={numero}
            onChange={(e) => {
              setNumero(e.target.value)
              clearFieldError('numero')
            }}
            margin="normal"
            required
            error={!!fieldErrors.numero}
            helperText={fieldErrors.numero}
          />
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
            required
            error={!!fieldErrors.descricao}
            helperText={fieldErrors.descricao}
          />
          <TextField
            fullWidth
            label="Endereço"
            value={endereco}
            onChange={(e) => {
              setEndereco(e.target.value)
              clearFieldError('endereco')
            }}
            margin="normal"
            error={!!fieldErrors.endereco}
            helperText={fieldErrors.endereco}
          />
          <TextField
            fullWidth
            label="Data"
            type="date"
            value={data}
            onChange={(e) => {
              setData(e.target.value)
              clearFieldError('data')
            }}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.data}
            helperText={fieldErrors.data}
          />
          <TextField
            fullWidth
            label="Valor (R$)"
            type="number"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value)
              clearFieldError('valor')
            }}
            margin="normal"
            error={!!fieldErrors.valor}
            helperText={fieldErrors.valor}
          />
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
