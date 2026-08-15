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
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import { formatPhone } from '../../utils/phone'
import { formatCnpj } from '../../utils/cnpj'
import { ufOptions } from '../companies/companiesTypes'
import { createClientSchema, updateClientSchema } from './clientSchemas'

interface ClientModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface ClientFormState {
  nome: string
  documento: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  uf: string
  observacoes: string
  status: string
}

const initialForm: ClientFormState = {
  nome: '',
  documento: '',
  email: '',
  telefone: '',
  endereco: '',
  cidade: '',
  uf: '',
  observacoes: '',
  status: 'ativo',
}

export default function ClientModal({ open, editId, onClose, onSaved }: ClientModalProps) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()
  const [form, setForm] = useState<ClientFormState>(initialForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(initialForm)
    setError('')
    setFieldErrors({})
    if (editId) {
      setFetching(true)
      api
        .get(`/clients/${editId}`)
        .then((res) => {
          const d = res.data
          setForm({
            nome: d.nome || '',
            documento: d.documento ? formatCnpj(d.documento) : '',
            email: d.email || '',
            telefone: d.telefone ? formatPhone(d.telefone) : '',
            endereco: d.endereco || '',
            cidade: d.cidade || '',
            uf: d.uf || '',
            observacoes: d.observacoes || '',
            status: d.status || 'ativo',
          })
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setFetching(false))
    }
  }, [open, editId])

  const handleChange = (key: keyof ClientFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const payload = {
      nome: form.nome,
      documento: form.documento || undefined,
      email: form.email || undefined,
      telefone: form.telefone || undefined,
      endereco: form.endereco || undefined,
      cidade: form.cidade || undefined,
      uf: form.uf || undefined,
      status: form.status,
      observacoes: form.observacoes || undefined,
    }

    const schema = isEdit ? updateClientSchema : createClientSchema
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
      onSaved()
      handleClose()
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
    setError('')
    setFieldErrors({})
    setForm(initialForm)
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
                  value={form.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
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
                  value={form.documento}
                  onChange={(e) => handleChange('documento', formatCnpj(e.target.value))}
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
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={form.telefone}
                  onChange={(e) => handleChange('telefone', formatPhone(e.target.value))}
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
                  value={form.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  error={!!fieldErrors.endereco}
                  helperText={fieldErrors.endereco}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Cidade"
                  value={form.cidade}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                  error={!!fieldErrors.cidade}
                  helperText={fieldErrors.cidade}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="UF"
                  value={form.uf}
                  onChange={(e) => handleChange('uf', e.target.value)}
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
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
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
                  value={form.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
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
