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
  Switch,
  FormControlLabel,
  Autocomplete,
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'

const baseSchema = z.object({
  cliente: z.string().min(1, 'Informe o cliente.'),
  descricao: z.string().optional(),
  siteId: z.string().optional(),
  endId: z.string().optional(),
  operadora: z.string().optional(),
  endereco: z.string().optional(),
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

interface ClientOption {
  id: number
  nome: string
}

interface StationOption {
  id: number
  siteId: string
  endId: string
  address: string | null
  mobileCarrier: string | null
}

interface RadioLinkOption {
  id: number
  nome: string
  siteIdA: string | null
  endIdA: string | null
  enderecoA: string | null
  operadoraA: string | null
}

export default function ServiceOrderModal({ open, editId, onClose, onSaved }: ServiceOrderModalProps) {
  const isEdit = Boolean(editId)

  const [numero, setNumero] = useState('')
  const [cliente, setCliente] = useState('')
  const [descricao, setDescricao] = useState('')
  const [siteId, setSiteId] = useState('')
  const [endId, setEndId] = useState('')
  const [operadora, setOperadora] = useState('')
  const [endereco, setEndereco] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState('aberta')
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const [clients, setClients] = useState<ClientOption[]>([])
  const [stations, setStations] = useState<StationOption[]>([])
  const [radioLinks, setRadioLinks] = useState<RadioLinkOption[]>([])
  const [targetType, setTargetType] = useState<'estacao' | 'enlace'>('estacao')
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
  const [selectedStation, setSelectedStation] = useState<StationOption | null>(null)
  const [selectedRadioLink, setSelectedRadioLink] = useState<RadioLinkOption | null>(null)

  useEffect(() => {
    if (!open) return
    api.get('/clients', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const d = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setClients(d)
      })
      .catch(() => {})
    api.get('/stations', { params: { limit: 1000, sortBy: 'siteId', sortOrder: 'ASC' } })
      .then((res) => {
        const d = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setStations(d)
      })
      .catch(() => {})
    api.get('/radio-links', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const d = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setRadioLinks(d)
      })
      .catch(() => {})
  }, [open])

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/service-orders/${editId}`)
        .then((res) => {
          const d = res.data
          setNumero(d.numero || '')
          setCliente(d.cliente || '')
          setSelectedClient(clients.find((c) => c.nome === d.cliente) || null)
          setDescricao(d.descricao || '')
          setSiteId(d.siteId || '')
          setEndId(d.endId || '')
          setOperadora(d.operadora || '')
          setEndereco(d.endereco || '')
          setDataInicio(d.dataInicio || '')
          setDataFim(d.dataFim || '')
          setStatus(d.status || 'aberta')
          setObservacoes(d.observacoes || '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId, clients])

  const getFieldErrors = (error: z.ZodError) =>
    Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSelectStation = (station: StationOption | null) => {
    setSelectedStation(station)
    setSiteId(station?.siteId ?? '')
    setEndId(station?.endId ?? '')
    setOperadora(station?.mobileCarrier ?? '')
    setEndereco(station?.address ?? '')
  }

  const handleSelectRadioLink = (link: RadioLinkOption | null) => {
    setSelectedRadioLink(link)
    setSiteId(link?.siteIdA ?? '')
    setEndId(link?.endIdA ?? '')
    setOperadora(link?.operadoraA ?? '')
    setEndereco(link?.enderecoA ?? '')
  }

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
      endereco,
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
      endereco,
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
    setEndereco('')
    setDataInicio('')
    setDataFim('')
    setStatus('aberta')
    setObservacoes('')
    setTargetType('estacao')
    setSelectedClient(null)
    setSelectedStation(null)
    setSelectedRadioLink(null)
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
          <Autocomplete
            fullWidth
            options={clients}
            getOptionLabel={(c) => c.nome}
            value={selectedClient}
            onChange={(_, v) => {
              setSelectedClient(v)
              setCliente(v?.nome ?? '')
              clearFieldError('cliente')
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                margin="normal"
                required
                placeholder="Busque pelo nome do cliente"
                error={!!fieldErrors.cliente}
                helperText={fieldErrors.cliente}
              />
            )}
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
          <FormControlLabel
            control={
              <Switch
                checked={targetType === 'enlace'}
                onChange={(e) => {
                  setTargetType(e.target.checked ? 'enlace' : 'estacao')
                  setSelectedStation(null)
                  setSelectedRadioLink(null)
                  setSiteId('')
                  setEndId('')
                  setOperadora('')
                  setEndereco('')
                }}
              />
            }
            label={targetType === 'estacao' ? 'Estação' : 'Enlace de Rádio'}
            sx={{ mt: 1 }}
          />
          {targetType === 'estacao' ? (
            <Autocomplete
              fullWidth
              options={stations}
              getOptionLabel={(s) => `${s.siteId} - ${s.address || s.endId}`}
              value={selectedStation}
              onChange={(_, v) => {
                handleSelectStation(v)
                clearFieldError('siteId')
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Estação"
                  margin="normal"
                  placeholder="Busque pelo site id ou endereço"
                  error={!!fieldErrors.siteId}
                  helperText={fieldErrors.siteId}
                />
              )}
            />
          ) : (
            <Autocomplete
              fullWidth
              options={radioLinks}
              getOptionLabel={(r) => r.nome}
              value={selectedRadioLink}
              onChange={(_, v) => {
                handleSelectRadioLink(v)
                clearFieldError('siteId')
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Enlace de Rádio"
                  margin="normal"
                  placeholder="Busque pelo nome do enlace"
                  error={!!fieldErrors.siteId}
                  helperText={fieldErrors.siteId}
                />
              )}
            />
          )}
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
