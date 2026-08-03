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
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  MenuItem,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { z } from 'zod'
import api from '../../services/api'
import { Company, ufOptions } from './companiesTypes'

const baseSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  cnpj: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  ativa: z.boolean().optional(),
  observacoes: z.string().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface CompanyModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function CompanyModal({ open, editId, onClose, onSaved }: CompanyModalProps) {
  const isEdit = Boolean(editId)

  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [ativa, setAtiva] = useState(true)
  const [observacoes, setObservacoes] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/companies/${editId}`)
        .then((res) => {
          const d: Company = res.data
          setNome(d.nome)
          setCnpj(d.cnpj || '')
          setEmail(d.email || '')
          setTelefone(d.telefone || '')
          setEndereco(d.endereco || '')
          setCidade(d.cidade || '')
          setUf(d.uf || '')
          setAtiva(d.ativa)
          setObservacoes(d.observacoes || '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const reset = () => {
    setNome('')
    setCnpj('')
    setEmail('')
    setTelefone('')
    setEndereco('')
    setCidade('')
    setUf('')
    setAtiva(true)
    setObservacoes('')
    setError('')
    setFieldErrors({})
    setDeleting(false)
  }

  const getFieldErrors = (error: z.ZodError) =>
    Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const payload = {
      nome,
      cnpj: cnpj || undefined,
      email: email || undefined,
      telefone: telefone || undefined,
      endereco: endereco || undefined,
      cidade: cidade || undefined,
      uf: uf || undefined,
      ativa,
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
        await api.patch(`/companies/${editId}`, payload)
      } else {
        await api.post('/companies', payload)
      }
      reset()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return
    setDeleting(true)
    try {
      await api.delete(`/companies/${editId}`)
      reset()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (loading || deleting) return
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Nome"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value)
              clearFieldError('nome')
            }}
            margin="normal"
            required
            autoFocus
            error={!!fieldErrors.nome}
            helperText={fieldErrors.nome}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CNPJ"
                value={cnpj}
                onChange={(e) => {
                  setCnpj(e.target.value)
                  clearFieldError('cnpj')
                }}
                margin="normal"
                error={!!fieldErrors.cnpj}
                helperText={fieldErrors.cnpj}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={telefone}
                onChange={(e) => {
                  setTelefone(e.target.value)
                  clearFieldError('telefone')
                }}
                margin="normal"
                error={!!fieldErrors.telefone}
                helperText={fieldErrors.telefone}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearFieldError('email')
            }}
            margin="normal"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                label="Cidade"
                value={cidade}
                onChange={(e) => {
                  setCidade(e.target.value)
                  clearFieldError('cidade')
                }}
                margin="normal"
                error={!!fieldErrors.cidade}
                helperText={fieldErrors.cidade}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                select
                label="UF"
                value={uf}
                onChange={(e) => {
                  setUf(e.target.value)
                  clearFieldError('uf')
                }}
                margin="normal"
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
          </Grid>
          <FormControlLabel
            control={<Switch checked={ativa} onChange={(e) => setAtiva(e.target.checked)} />}
            label={ativa ? 'Empresa ativa' : 'Empresa inativa'}
            sx={{ mt: 1 }}
          />
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
            margin="normal"
            error={!!fieldErrors.observacoes}
            helperText={fieldErrors.observacoes}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEdit && (
            <Tooltip title="Excluir empresa">
              <IconButton color="error" onClick={handleDelete} disabled={loading || deleting} sx={{ mr: 'auto' }}>
                <Delete />
              </IconButton>
            </Tooltip>
          )}
          <Button onClick={handleClose} disabled={loading || deleting}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading || deleting}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
