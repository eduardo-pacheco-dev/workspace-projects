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
  MenuItem,
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'

const brands = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'Amex' },
  { value: 'hipercard', label: 'Hipercard' },
]

const baseSchema = z.object({
  name: z.string().min(1, 'Informe um nome.'),
  bank: z.string().optional(),
  brand: z.enum(['visa', 'mastercard', 'elo', 'amex', 'hipercard']).optional(),
  limit: z.number('Informe um limite válido.').nonnegative('O limite deve ser maior ou igual a zero.'),
  closingDay: z
    .number('Informe o dia de fechamento.')
    .int('Dia inválido.')
    .min(1, 'O dia deve estar entre 1 e 28.')
    .max(28, 'O dia deve estar entre 1 e 28.'),
  dueDay: z
    .number('Informe o dia de vencimento.')
    .int('Dia inválido.')
    .min(1, 'O dia deve estar entre 1 e 28.')
    .max(28, 'O dia deve estar entre 1 e 28.'),
})

const editSchema = baseSchema.partial()

interface CardModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function CardModal({ open, editId, onClose, onSaved }: CardModalProps) {
  const isEdit = Boolean(editId)
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [brand, setBrand] = useState('')
  const [limit, setLimit] = useState('')
  const [closingDay, setClosingDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setBank('')
      setBrand('')
      setLimit('')
      setClosingDay('')
      setDueDay('')
      setError('')
      setFieldErrors({})

      if (editId) {
        setLoading(true)
        api
          .get(`/finance/cards/${editId}`)
          .then((res) => {
            const d = res.data
            setName(d.name || '')
            setBank(d.bank || '')
            setBrand(d.brand || '')
            setLimit(d.limit != null ? String(d.limit) : '')
            setClosingDay(d.closingDay != null ? String(d.closingDay) : '')
            setDueDay(d.dueDay != null ? String(d.dueDay) : '')
          })
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

    const formData = {
      name,
      bank: bank || undefined,
      brand: (brand || undefined) as any,
      limit: Number(limit),
      closingDay: Number(closingDay),
      dueDay: Number(dueDay),
    }

    const schema = isEdit ? editSchema : baseSchema
    const result = schema.safeParse(formData)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/finance/cards/${editId}`, result.data)
      } else {
        await api.post('/finance/cards', result.data)
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
        <DialogTitle>{isEdit ? 'Editar Cartão' : 'Novo Cartão'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Nome"
            value={name}
            onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
            margin="normal"
            required
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
            placeholder="ex.: Cartão Nubank, Cartão Itaú"
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Banco"
                value={bank}
                onChange={(e) => { setBank(e.target.value); clearFieldError('bank') }}
                margin="normal"
                placeholder="ex.: Nubank, Itaú, Caixa"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Bandeira"
                value={brand}
                onChange={(e) => { setBrand(e.target.value); clearFieldError('brand') }}
                margin="normal"
                error={!!fieldErrors.brand}
                helperText={fieldErrors.brand || ' '}
              >
                <MenuItem value="">Nenhuma</MenuItem>
                {brands.map((b) => (
                  <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Limite (R$)"
            type="number"
            inputProps={{ step: '0.01' }}
            value={limit}
            onChange={(e) => { setLimit(e.target.value); clearFieldError('limit') }}
            margin="normal"
            required
            error={!!fieldErrors.limit}
            helperText={fieldErrors.limit}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dia do fechamento"
                type="number"
                inputProps={{ min: 1, max: 28 }}
                value={closingDay}
                onChange={(e) => { setClosingDay(e.target.value); clearFieldError('closingDay') }}
                margin="normal"
                required
                error={!!fieldErrors.closingDay}
                helperText={fieldErrors.closingDay || 'Dia em que a fatura fecha (1 a 28)'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dia do vencimento"
                type="number"
                inputProps={{ min: 1, max: 28 }}
                value={dueDay}
                onChange={(e) => { setDueDay(e.target.value); clearFieldError('dueDay') }}
                margin="normal"
                required
                error={!!fieldErrors.dueDay}
                helperText={fieldErrors.dueDay || 'Dia em que a fatura vence (1 a 28)'}
              />
            </Grid>
          </Grid>
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
