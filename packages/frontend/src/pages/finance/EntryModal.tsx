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
  type: z.enum(['income', 'expense', 'transfer'], 'Invalid type.'),
  description: z.string().min(1, 'Enter a description.'),
  category: z.string().min(1, 'Enter a category.'),
  amount: z.number().positive('Enter an amount greater than zero.'),
  date: z.string().min(1, 'Enter a date.'),
  paymentMethod: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

const typeLabels: Record<string, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  canceled: 'Canceled',
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
      setError('')
      setFieldErrors({})

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
          })
          .catch((err) => setError(err.response?.data?.message || 'Could not load data.'))
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
      setError(err.response?.data?.message || 'Could not save. Try again.')
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
        <DialogTitle>{isEdit ? 'Edit Entry' : 'New Entry'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type"
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
            label="Description"
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
                label="Category"
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
                label="Amount (R$)"
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
                label="Date"
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
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => { setPaymentMethod(e.target.value); clearFieldError('paymentMethod') }}
                margin="normal"
                placeholder="e.g. Pix, Credit Card, Cash"
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="Notes"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); clearFieldError('notes') }}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Save' : 'Create')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
