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

const typeOptions = ['income', 'expense', 'transfer']
const statusOptions = ['pending', 'paid', 'canceled']

const baseSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer'], 'Tipo inválido.'),
  description: z.string().min(1, 'Informe uma descrição.'),
  category: z.string().min(1, 'Informe uma categoria.'),
  amount: z.number().positive('Informe um valor maior que zero.'),
  date: z.string().min(1, 'Informe uma data.'),
  paymentMethod: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  accountId: z.number().int('Conta inválida.').nullable().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

const typeLabels: Record<string, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  canceled: 'Cancelado',
}

interface AccountOption {
  id: number
  name: string
}

interface EntryModalProps {
  open: boolean
  editId?: number | null
  defaultType?: string
  defaultDate?: string
  onClose: () => void
  onSaved: () => void
}

export default function EntryModal({ open, editId, defaultType, defaultDate, onClose, onSaved }: EntryModalProps) {
  const isEdit = Boolean(editId)
  const [type, setType] = useState(defaultType || 'expense')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(defaultDate || '')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [status, setStatus] = useState('paid')
  const [notes, setNotes] = useState('')
  const [accountId, setAccountId] = useState<number | ''>('')
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setType(defaultType || 'expense')
      setDescription('')
      setCategory('')
      setAmount('')
      setDate(defaultDate || '')
      setPaymentMethod('')
      setStatus('paid')
      setNotes('')
      setAccountId('')
      setError('')
      setFieldErrors({})

      api
        .get('/finance/accounts', { params: { limit: 100, sortBy: 'name', sortOrder: 'ASC' } })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
          setAccounts(data)
        })
        .catch(() => {})

      if (editId) {
        setLoading(true)
        api
          .get(`/finance/entries/${editId}`)
          .then((res) => {
            const d = res.data
            setType(d.type || 'expense')
            setDescription(d.description || '')
            setCategory(d.category || '')
            setAmount(d.amount != null ? String(d.amount) : '')
            setDate(d.date || '')
            setPaymentMethod(d.paymentMethod || '')
            setStatus(d.status || 'paid')
            setNotes(d.notes || '')
            setAccountId(d.accountId ?? '')
          })
          .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
          .finally(() => setLoading(false))
      }
    }
  }, [open, editId, defaultType, defaultDate])

  const getFieldErrors = (err: z.ZodError) =>
    Object.fromEntries(err.issues.map((issue) => [issue.path[0], issue.message]))

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const formData = {
      type,
      description,
      category,
      amount: Number(amount),
      date,
      paymentMethod: paymentMethod || undefined,
      status,
      notes: notes || undefined,
      accountId: accountId === '' ? null : accountId,
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
        await api.patch(`/finance/entries/${editId}`, result.data)
      } else {
        await api.post('/finance/entries', result.data)
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
        <DialogTitle>{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tipo"
                value={type}
                onChange={(e) => { setType(e.target.value); clearFieldError('type') }}
                margin="normal"
                error={!!fieldErrors.type}
                helperText={fieldErrors.type}
              >
                {typeOptions.map((t) => (
                  <MenuItem key={t} value={t}>{typeLabels[t]}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={status}
                onChange={(e) => { setStatus(e.target.value); clearFieldError('status') }}
                margin="normal"
              >
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>{statusLabels[s]}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Descrição"
            value={description}
            onChange={(e) => { setDescription(e.target.value); clearFieldError('description') }}
            margin="normal"
            required
            error={!!fieldErrors.description}
            helperText={fieldErrors.description}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Categoria"
                value={category}
                onChange={(e) => { setCategory(e.target.value); clearFieldError('category') }}
                margin="normal"
                required
                error={!!fieldErrors.category}
                helperText={fieldErrors.category}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor (R$)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); clearFieldError('amount') }}
                margin="normal"
                required
                error={!!fieldErrors.amount}
                helperText={fieldErrors.amount}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data"
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); clearFieldError('date') }}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                error={!!fieldErrors.date}
                helperText={fieldErrors.date}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Forma de Pagamento"
                value={paymentMethod}
                onChange={(e) => { setPaymentMethod(e.target.value); clearFieldError('paymentMethod') }}
                margin="normal"
                placeholder="ex.: Pix, Cartão de Crédito, Dinheiro"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Conta"
                value={accountId}
                onChange={(e) => { setAccountId(e.target.value === '' ? '' : Number(e.target.value)); clearFieldError('accountId') }}
                margin="normal"
              >
                <MenuItem value="">Sem conta</MenuItem>
                {accounts.map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Observações"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); clearFieldError('notes') }}
            margin="normal"
            multiline
            rows={2}
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
