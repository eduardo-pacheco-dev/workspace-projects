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
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'

const baseSchema = z.object({
  name: z.string().min(1, 'Informe um nome.'),
  bank: z.string().optional(),
  balance: z.number('Informe um saldo válido.'),
})

const createSchema = baseSchema
const editSchema = baseSchema.partial()

interface AccountModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function AccountModal({ open, editId, onClose, onSaved }: AccountModalProps) {
  const isEdit = Boolean(editId)
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [balance, setBalance] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setBank('')
      setBalance('')
      setError('')
      setFieldErrors({})

      if (editId) {
        setLoading(true)
        api
          .get(`/finance/accounts/${editId}`)
          .then((res) => {
            const d = res.data
            setName(d.name || '')
            setBank(d.bank || '')
            setBalance(d.balance != null ? String(d.balance) : '')
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
      balance: Number(balance),
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
        await api.patch(`/finance/accounts/${editId}`, result.data)
      } else {
        await api.post('/finance/accounts', result.data)
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
        <DialogTitle>{isEdit ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
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
            placeholder="ex.: Conta Corrente, Poupança, Carteira"
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
                label="Saldo (R$)"
                type="number"
                inputProps={{ step: '0.01' }}
                value={balance}
                onChange={(e) => { setBalance(e.target.value); clearFieldError('balance') }}
                margin="normal"
                required
                error={!!fieldErrors.balance}
                helperText={fieldErrors.balance}
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
