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
import api from '../../services/api'
import { getFieldErrors } from '../../schemas/authSchemas'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { createCompanySchema, updateCompanySchema } from './companySchemas'
import { Company, ufOptions } from './companiesTypes'

interface CompanyModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface CompanyFormState {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  uf: string
  ativa: boolean
  observacoes: string
}

const initialForm: CompanyFormState = {
  nome: '',
  cnpj: '',
  email: '',
  telefone: '',
  endereco: '',
  cidade: '',
  uf: '',
  ativa: true,
  observacoes: '',
}

export default function CompanyModal({ open, editId, onClose, onSaved }: CompanyModalProps) {
  const isEdit = Boolean(editId)
  const [form, setForm] = useState<CompanyFormState>(initialForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/companies/${editId}`)
        .then((res) => {
          const d: Company = res.data
          setForm({
            nome: d.nome,
            cnpj: d.cnpj || '',
            email: d.email || '',
            telefone: d.telefone || '',
            endereco: d.endereco || '',
            cidade: d.cidade || '',
            uf: d.uf || '',
            ativa: d.ativa,
            observacoes: d.observacoes || '',
          })
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const handleChange = (key: keyof CompanyFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const payload = {
      nome: form.nome,
      cnpj: form.cnpj || undefined,
      email: form.email || undefined,
      telefone: form.telefone || undefined,
      endereco: form.endereco || undefined,
      cidade: form.cidade || undefined,
      uf: form.uf || undefined,
      ativa: form.ativa,
      observacoes: form.observacoes || undefined,
    }

    const schema = isEdit ? updateCompanySchema : createCompanySchema
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
      onSaved()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    setDeleting(true)
    try {
      await api.delete(`/companies/${editId}`)
      onSaved()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (loading || deleting) return
    setError('')
    setFieldErrors({})
    setForm(initialForm)
    setConfirmDelete(false)
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
            value={form.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
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
                value={form.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                margin="normal"
                error={!!fieldErrors.cnpj}
                helperText={fieldErrors.cnpj}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                value={form.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
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
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            margin="normal"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
          <TextField
            fullWidth
            label="Endereço"
            value={form.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            margin="normal"
            error={!!fieldErrors.endereco}
            helperText={fieldErrors.endereco}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                label="Cidade"
                value={form.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
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
                value={form.uf}
                onChange={(e) => handleChange('uf', e.target.value)}
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
            control={<Switch checked={form.ativa} onChange={(e) => handleChange('ativa', e.target.checked)} />}
            label={form.ativa ? 'Empresa ativa' : 'Empresa inativa'}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="Observações"
            multiline
            rows={3}
            value={form.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            margin="normal"
            error={!!fieldErrors.observacoes}
            helperText={fieldErrors.observacoes}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEdit && (
            <Tooltip title="Excluir empresa">
              <IconButton color="error" onClick={() => setConfirmDelete(true)} disabled={loading || deleting} sx={{ mr: 'auto' }}>
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

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir empresa"
        message="Tem certeza que deseja excluir esta empresa?"
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Dialog>
  )
}
