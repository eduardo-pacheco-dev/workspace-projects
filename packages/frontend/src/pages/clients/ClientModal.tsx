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
import { z } from 'zod'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { formatPhone } from '../../utils/phone'
import { formatCnpj } from '../../utils/cnpj'
import { ufOptions } from '../companies/companiesTypes'

const baseSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  documento: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
  observacoes: z.string().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface ClientModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function ClientModal({ open, editId, onClose, onSaved }: ClientModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  const reset = () => {
    setNome('')
    setDocumento('')
    setEmail('')
    setTelefone('')
    setEndereco('')
    setCidade('')
    setUf('')
    setObservacoes('')
    setStatus('ativo')
    setError('')
    setFieldErrors({})
  }

  useEffect(() => {
    if (!open) return
    reset()
    if (editId) {
      setFetching(true)
      api
        .get(`/clients/${editId}`)
        .then((res) => {
          const d = res.data
          setNome(d.nome || '')
          setDocumento(d.documento ? formatCnpj(d.documento) : '')
          setEmail(d.email || '')
          setTelefone(d.telefone ? formatPhone(d.telefone) : '')
          setEndereco(d.endereco || '')
          setCidade(d.cidade || '')
          setUf(d.uf || '')
          setObservacoes(d.observacoes || '')
          setStatus(d.status || 'ativo')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setFetching(false))
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

    const payload: any = {
      nome,
      documento: documento || undefined,
      email: email || undefined,
      telefone: telefone || undefined,
      endereco: endereco || undefined,
      cidade: cidade || undefined,
      uf: uf || undefined,
      status,
      observacoes: observacoes || undefined,
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(payload)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/clients/${editId}`, payload)
      } else {
        await api.post('/clients', payload)
      }
      showToast(isEdit ? 'Cliente atualizado com sucesso.' : 'Cliente criado com sucesso.')
      reset()
      onSaved()
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Não foi possível salvar. Tente novamente.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading || fetching) return
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {fetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    clearFieldError('nome')
                  }}
                  required
                  autoFocus
                  error={!!fieldErrors.nome}
                  helperText={fieldErrors.nome}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={documento}
                  onChange={(e) => {
                    setDocumento(formatCnpj(e.target.value))
                    clearFieldError('documento')
                  }}
                  placeholder="00.000.000/0000-00"
                  error={!!fieldErrors.documento}
                  helperText={fieldErrors.documento}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError('email')
                  }}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(formatPhone(e.target.value))
                    clearFieldError('telefone')
                  }}
                  placeholder="(00) 00000-0000"
                  inputProps={{ maxLength: 15 }}
                  error={!!fieldErrors.telefone}
                  helperText={fieldErrors.telefone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Endereço"
                  value={endereco}
                  onChange={(e) => {
                    setEndereco(e.target.value)
                    clearFieldError('endereco')
                  }}
                  error={!!fieldErrors.endereco}
                  helperText={fieldErrors.endereco}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={cidade}
                  onChange={(e) => {
                    setCidade(e.target.value)
                    clearFieldError('cidade')
                  }}
                  error={!!fieldErrors.cidade}
                  helperText={fieldErrors.cidade}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="UF"
                  value={uf}
                  onChange={(e) => {
                    setUf(e.target.value)
                    clearFieldError('uf')
                  }}
                  error={!!fieldErrors.uf}
                  helperText={fieldErrors.uf}
                >
                  <MenuItem value="">
                    <em>-</em>
                  </MenuItem>
                  {ufOptions.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    clearFieldError('status')
                  }}
                  required
                  error={!!fieldErrors.status}
                  helperText={fieldErrors.status}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} />
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observações"
                  multiline
                  rows={3}
                  value={observacoes}
                  onChange={(e) => {
                    setObservacoes(e.target.value)
                    clearFieldError('observacoes')
                  }}
                  error={!!fieldErrors.observacoes}
                  helperText={fieldErrors.observacoes}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading || fetching}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || fetching}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
