import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { getFieldErrors } from '../../schemas/authSchemas'
import { contractSchema } from './contractSchemas'

interface ContractFormState {
  proposalId: string
  jobId: string
  freelancerId: string
  clientId: string
  startDate: string
  endDate: string
  totalBudget: string
}

const initialForm: ContractFormState = {
  proposalId: '',
  jobId: '',
  freelancerId: '',
  clientId: '',
  startDate: '',
  endDate: '',
  totalBudget: '',
}

export default function ContractForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState<ContractFormState>(initialForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/contracts/${id}`)
        .then((res) => {
          const data = res.data
          setForm({
            proposalId: data.proposalId ? String(data.proposalId) : '',
            jobId: String(data.jobId || ''),
            freelancerId: String(data.freelancerId || ''),
            clientId: String(data.clientId || ''),
            startDate: data.startDate ? data.startDate.slice(0, 10) : '',
            endDate: data.endDate ? data.endDate.slice(0, 10) : '',
            totalBudget: data.totalBudget ? String(data.totalBudget) : '',
          })
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [id, isEdit])

  const handleChange = (key: keyof ContractFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = contractSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: Record<string, any> = {
      proposalId: form.proposalId ? Number(form.proposalId) : undefined,
      jobId: Number(form.jobId),
      freelancerId: Number(form.freelancerId),
      clientId: Number(form.clientId),
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      totalBudget: Number(form.totalBudget),
    }
    if (!isEdit) payload.status = 'active'

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/contracts/${id}`, payload)
      } else {
        await api.post('/contracts', payload)
      }
      showToast(isEdit ? 'Contrato atualizado com sucesso.' : 'Contrato criado com sucesso.')
      navigate('/contracts')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível salvar. Tente novamente.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{isEdit ? 'Editar Contrato' : 'Novo Contrato'}</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="ID da Proposta"
              type="number"
              value={form.proposalId}
              onChange={(e) => handleChange('proposalId', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="ID do Job"
              type="number"
              value={form.jobId}
              onChange={(e) => handleChange('jobId', e.target.value)}
              margin="normal"
              required
              error={!!fieldErrors.jobId}
              helperText={fieldErrors.jobId}
            />
            <TextField
              fullWidth
              label="ID do Freelancer"
              type="number"
              value={form.freelancerId}
              onChange={(e) => handleChange('freelancerId', e.target.value)}
              margin="normal"
              required
              error={!!fieldErrors.freelancerId}
              helperText={fieldErrors.freelancerId}
            />
            <TextField
              fullWidth
              label="ID do Cliente"
              type="number"
              value={form.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              margin="normal"
              required
              error={!!fieldErrors.clientId}
              helperText={fieldErrors.clientId}
            />
            <TextField
              fullWidth
              label="Data de Início"
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              error={!!fieldErrors.startDate}
              helperText={fieldErrors.startDate}
            />
            <TextField
              fullWidth
              label="Data de Término"
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Orçamento Total"
              type="number"
              value={form.totalBudget}
              onChange={(e) => handleChange('totalBudget', e.target.value)}
              margin="normal"
              required
              error={!!fieldErrors.totalBudget}
              helperText={fieldErrors.totalBudget}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/contracts')}>Cancelar</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
