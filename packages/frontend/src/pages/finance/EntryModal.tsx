import { useState, useEffect, FormEvent, useRef } from 'react'
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
  Typography,
  Link,
  IconButton,
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import { z } from 'zod'
import api from '../../services/api'

const typeOptions = ['income', 'expense', 'transfer']
const statusOptions = ['pending', 'paid', 'canceled']
const recurrenceOptions = ['once', 'daily', 'weekly', 'monthly', 'yearly']

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
  cardId: z.number().int('Cartão inválido.').nullable().optional(),
  recurrence: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly'], 'Repetição inválida.').optional(),
  recurrenceEnd: z.string().optional(),
  tags: z.string().optional(),
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

const recurrenceLabels: Record<string, string> = {
  once: 'Não repete',
  daily: 'Diariamente',
  weekly: 'Semanalmente',
  monthly: 'Mensalmente',
  yearly: 'Anualmente',
}

interface AccountOption {
  id: number
  name: string
}

interface CardOption {
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
  const [cardId, setCardId] = useState<number | ''>('')
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [cards, setCards] = useState<CardOption[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [recurrence, setRecurrence] = useState('once')
  const [recurrenceEnd, setRecurrenceEnd] = useState('')
  const [tags, setTags] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentPath, setAttachmentPath] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setCardId('')
      setRecurrence('once')
      setRecurrenceEnd('')
      setTags('')
      setAttachmentFile(null)
      setAttachmentPath('')
      setError('')
      setFieldErrors({})

      api
        .get('/finance/accounts', { params: { limit: 100, sortBy: 'name', sortOrder: 'ASC' } })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
          setAccounts(data)
        })
        .catch(() => {})

      api
        .get('/finance/categories', { params: { limit: 100, sortBy: 'name', sortOrder: 'ASC' } })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
          setCategories(data.map((c: { name: string }) => c.name))
        })
        .catch(() => {})

      api
        .get('/finance/cards', { params: { limit: 100, sortBy: 'name', sortOrder: 'ASC' } })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
          setCards(data)
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
            setCardId(d.cardId ?? '')
            setRecurrence(d.recurrence || 'once')
            setRecurrenceEnd(d.recurrenceEnd || '')
            setTags(d.tags || '')
            setAttachmentPath(d.attachment || '')
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
      cardId: cardId === '' ? null : cardId,
      recurrence,
      recurrenceEnd: recurrence !== 'once' ? recurrenceEnd || undefined : undefined,
      tags: tags.trim() || undefined,
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(formData)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    setLoading(true)
    try {
      let entryId: number
      if (isEdit) {
        const res = await api.patch(`/finance/entries/${editId}`, result.data)
        entryId = Number(editId)
        if (attachmentFile) {
          const form = new FormData()
          form.append('file', attachmentFile)
          await api.post(`/finance/entries/${entryId}/attachment`, form)
        }
        void res
      } else {
        const res = await api.post('/finance/entries', result.data)
        const created = Array.isArray(res.data) ? res.data[0] : res.data
        entryId = created.id
        if (attachmentFile) {
          const form = new FormData()
          form.append('file', attachmentFile)
          await api.post(`/finance/entries/${entryId}/attachment`, form)
        }
      }
      onSaved()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAttachment = async () => {
    if (attachmentPath && isEdit) {
      try {
        await api.delete(`/finance/entries/${editId}/attachment`)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Não foi possível remover o anexo.')
        return
      }
    }
    setAttachmentPath('')
    setAttachmentFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setFieldErrors({})
    onClose()
  }

  const attachmentName = attachmentFile ? attachmentFile.name : attachmentPath ? attachmentPath.split('/').pop() : ''

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
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Cartão"
                value={cardId}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : Number(e.target.value)
                  setCardId(value)
                  clearFieldError('cardId')
                  if (value !== '') {
                    setPaymentMethod('Cartão de Crédito')
                  }
                }}
                margin="normal"
              >
                <MenuItem value="">Sem cartão</MenuItem>
                {cards.map((card) => (
                  <MenuItem key={card.id} value={card.id}>{card.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Repetir"
                value={recurrence}
                onChange={(e) => { setRecurrence(e.target.value); clearFieldError('recurrence') }}
                margin="normal"
              >
                {recurrenceOptions.map((r) => (
                  <MenuItem key={r} value={r}>{recurrenceLabels[r]}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          {recurrence !== 'once' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data final"
                  type="date"
                  value={recurrenceEnd}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  margin="normal"
                  placeholder="ex.: viagem, trabalho"
                />
              </Grid>
            </Grid>
          )}
          {recurrence === 'once' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  margin="normal"
                  placeholder="ex.: viagem, trabalho"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mt: 2 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      if (file) {
                        setAttachmentFile(file)
                        setAttachmentPath('')
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Anexar arquivo
                  </Button>
                  {attachmentName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {attachmentPath ? (
                        <Link href={attachmentPath} target="_blank" rel="noreferrer" variant="body2">
                          {attachmentName}
                        </Link>
                      ) : (
                        <Typography variant="body2">{attachmentName}</Typography>
                      )}
                      <IconButton size="small" onClick={handleRemoveAttachment} sx={{ ml: 0.5 }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
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
