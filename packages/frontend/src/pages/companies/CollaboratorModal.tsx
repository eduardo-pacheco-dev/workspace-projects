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
  FormControlLabel,
  Switch,
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'
import { CompanyCollaborator } from './companiesTypes'

const baseSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  cargo: z.string().optional(),
  email: z.string().email('Informe um e-mail válido.').optional().or(z.literal('')),
  telefone: z.string().optional(),
  ativo: z.boolean().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface CollaboratorModalProps {
  open: boolean
  companyId: number
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function CollaboratorModal({ open, companyId, editId, onClose, onSaved }: CollaboratorModalProps) {
  const isEdit = Boolean(editId)

  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/companies/${companyId}/collaborators/${editId}`)
        .then((res) => {
          const d: CompanyCollaborator = res.data
          setNome(d.nome)
          setCargo(d.cargo || '')
          setEmail(d.email || '')
          setTelefone(d.telefone || '')
          setAtivo(d.ativo)
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId, companyId])

  const reset = () => {
    setNome('')
    setCargo('')
    setEmail('')
    setTelefone('')
    setAtivo(true)
    setError('')
    setFieldErrors({})
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
      cargo: cargo || undefined,
      email: email || undefined,
      telefone: telefone || undefined,
      ativo,
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
        await api.patch(`/companies/${companyId}/collaborators/${editId}`, payload)
      } else {
        await api.post(`/companies/${companyId}/collaborators`, payload)
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

  const handleClose = () => {
    if (loading) return
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
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
          <TextField
            fullWidth
            label="Cargo"
            value={cargo}
            onChange={(e) => {
              setCargo(e.target.value)
              clearFieldError('cargo')
            }}
            margin="normal"
            error={!!fieldErrors.cargo}
            helperText={fieldErrors.cargo}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
          <FormControlLabel
            control={<Switch checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />}
            label={ativo ? 'Colaborador ativo' : 'Colaborador inativo'}
            sx={{ mt: 1 }}
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
