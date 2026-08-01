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
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'

const baseSchema = z.object({
  name: z.string().min(1, 'Informe um nome.'),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface CategoryModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function CategoryModal({ open, editId, onClose, onSaved }: CategoryModalProps) {
  const isEdit = Boolean(editId)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setError('')
      setFieldErrors({})

      if (editId) {
        setLoading(true)
        api
          .get(`/finance/categories/${editId}`)
          .then((res) => setName(res.data.name || ''))
          .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
          .finally(() => setLoading(false))
      }
    }
  }, [open, editId])

  const getFieldErrors = (err: z.ZodError) =>
    Object.fromEntries(err.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const formData = { name }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(formData)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/finance/categories/${editId}`, result.data)
      } else {
        await api.post('/finance/categories', result.data)
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
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Nome"
            value={name}
            onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
            margin="normal"
            required
            autoFocus
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
            placeholder="ex.: Alimentação, Transporte, Salário"
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
