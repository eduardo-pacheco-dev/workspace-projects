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
import api from '../../services/api'
import { getFieldErrors } from '../../schemas/authSchemas'
import useServiceOrderOptions from '../../hooks/useServiceOrderOptions'
import ClientAutocomplete from '../../components/service-orders/ClientAutocomplete'
import ServiceTargetPicker from '../../components/service-orders/ServiceTargetPicker'
import { createServiceOrderSchema, updateServiceOrderSchema } from './serviceOrderSchemas'
import { ClientOption, RadioLinkOption, StationOption } from './serviceOrdersTypes'

interface ServiceOrderModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function ServiceOrderModal({ open, editId, onClose, onSaved }: ServiceOrderModalProps) {
  const isEdit = Boolean(editId)
  const { clients, stations, radioLinks } = useServiceOrderOptions(open)

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
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
  const [selectedStation, setSelectedStation] = useState<StationOption | null>(null)
  const [selectedRadioLink, setSelectedRadioLink] = useState<RadioLinkOption | null>(null)

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

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

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

    const schema = isEdit ? updateServiceOrderSchema : createServiceOrderSchema
    const result = schema.safeParse(formData)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: any = { ...formData }
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
          <ClientAutocomplete
            clients={clients}
            value={selectedClient}
            onChange={(client) => {
              setSelectedClient(client)
              setCliente(client?.nome ?? '')
              clearFieldError('cliente')
            }}
            error={fieldErrors.cliente}
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
          <ServiceTargetPicker
            stations={stations}
            radioLinks={radioLinks}
            selectedStation={selectedStation}
            selectedRadioLink={selectedRadioLink}
            onSelectStation={(station) => {
              handleSelectStation(station)
              clearFieldError('siteId')
            }}
            onSelectRadioLink={(link) => {
              handleSelectRadioLink(link)
              clearFieldError('siteId')
            }}
            error={fieldErrors.siteId}
          />
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
