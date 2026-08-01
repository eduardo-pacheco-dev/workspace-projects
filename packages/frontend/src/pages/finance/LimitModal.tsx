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
import { monthNames } from '../../utils/format'

const baseSchema = z.object({
  category: z.string().min(1, 'Informe uma categoria.'),
  month: z.number().int().min(1, 'Mês inválido.').max(12, 'Mês inválido.'),
  year: z.number().int().min(2000, 'Ano inválido.').max(2100, 'Ano inválido.'),
  amount: z.number().positive('Informe um valor maior que zero.'),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface LimitModalProps {
  open: boolean
  editId?: number | null
  defaultMonth?: number
  defaultYear?: number
  onClose: () => void
  onSaved: () => void
}

export default function LimitModal({ open, editId, defaultMonth, defaultYear, onClose, onSaved }: LimitModalProps) {
  const isEdit = Boolean(editId)
  const [category, setCategory] = useState('')
  const [month, setMonth] = useState(defaultMonth || new Date().getMonth() + 1)
  const [year, setYear] = useState(defaultYear || new Date().getFullYear())
  const [amount, setAmount] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setCategory('')
      setMonth(defaultMonth || new Date().getMonth() + 1)
      setYear(defaultYear || new Date().getFullYear())
      setAmount('')
      setError('')
      setFieldErrors({})

      api
        .get('/finance/categories', { params: { limit: 100, sortBy: 'name', sortOrder: 'ASC' } })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
          setCategories(data.map((c: { name: string }) => c.name))
        })
        .catch(() => {})

      if (editId) {
        setLoading(true)
        api
          .get(`/finance/limits/${editId}`)
          .then((res) => {
            const d = res.data
            setCategory(d.category || '')
            setMonth(d.month || defaultMonth || new Date().getMonth() + 1)
            setYear(d.year || defaultYear || new Date().getFullYear())
            setAmount(d.amount != null ? String(d.amount) : '')
          })
          .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
          .finally(() => setLoading(false))
      }
    }
  }, [open, editId, defaultMonth, defaultYear])

  const getFieldErrors = (err: z.ZodError) =>
    Object.fromEntries(err.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const formData = {
      category,
      month: Number(month),
      year: Number(year),
      amount: Number(amount),
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(formData)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/finance/limits/${editId}`, result.data)
      } else {
        await api.post('/finance/limits', result.data)
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
        <DialogTitle>{isEdit ? 'Editar Limite de Gasto' : 'Novo Limite de Gasto'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            select
            label="Categoria"
            value={category}
            onChange={(e) => { setCategory(e.target.value); clearFieldError('category') }}
            margin="normal"
            required
            error={!!fieldErrors.category}
            helperText={fieldErrors.category}
          >
            {category && !categories.includes(category) && (
              <MenuItem key={`current-${category}`} value={category}>{category}</MenuItem>
            )}
            {categories.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Mês"
                value={month}
                onChange={(e) => { setMonth(Number(e.target.value)); clearFieldError('month') }}
                margin="normal"
                error={!!fieldErrors.month}
                helperText={fieldErrors.month}
              >
                {monthNames.map((name, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ano"
                type="number"
                value={year}
                onChange={(e) => { setYear(Number(e.target.value)); clearFieldError('year') }}
                margin="normal"
                required
                error={!!fieldErrors.year}
                helperText={fieldErrors.year}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Valor do Limite (R$)"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); clearFieldError('amount') }}
            margin="normal"
            required
            error={!!fieldErrors.amount}
            helperText={fieldErrors.amount}
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
