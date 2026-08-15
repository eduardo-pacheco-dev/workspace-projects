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
import { proposalSchema } from './proposalSchemas'

interface ProposalFormState {
  jobId: string
  freelancerId: string
  coverLetter: string
  proposedRate: string
  estimatedDuration: string
}

const initialForm: ProposalFormState = {
  jobId: '',
  freelancerId: '',
  coverLetter: '',
  proposedRate: '',
  estimatedDuration: '',
}

export default function ProposalForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState<ProposalFormState>(initialForm)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/proposals/${id}`)
        .then((res) => {
          const data = res.data
          setForm({
            jobId: String(data.jobId || ''),
            freelancerId: String(data.freelancerId || ''),
            coverLetter: data.coverLetter || '',
            proposedRate: data.proposedRate ? String(data.proposedRate) : '',
            estimatedDuration: data.estimatedDuration || '',
          })
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [id, isEdit])

  const handleChange = (key: keyof ProposalFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const result = proposalSchema.safeParse(form)
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error))
      return
    }

    const payload: Record<string, any> = {
      jobId: Number(form.jobId),
      freelancerId: Number(form.freelancerId),
      coverLetter: form.coverLetter,
      proposedRate: Number(form.proposedRate),
      estimatedDuration: form.estimatedDuration,
    }
    if (!isEdit) payload.status = 'pending'

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/proposals/${id}`, payload)
      } else {
        await api.post('/proposals', payload)
      }
      showToast(isEdit ? 'Proposta atualizada com sucesso.' : 'Proposta criada com sucesso.')
      navigate('/proposals')
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
          <Typography variant="h5" gutterBottom>{isEdit ? 'Editar Proposta' : 'Nova Proposta'}</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
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
              label="Carta de Apresentação"
              multiline
              rows={4}
              value={form.coverLetter}
              onChange={(e) => handleChange('coverLetter', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Taxa Proposta"
              type="number"
              value={form.proposedRate}
              onChange={(e) => handleChange('proposedRate', e.target.value)}
              margin="normal"
              required
              error={!!fieldErrors.proposedRate}
              helperText={fieldErrors.proposedRate}
            />
            <TextField
              fullWidth
              label="Duração Estimada"
              value={form.estimatedDuration}
              onChange={(e) => handleChange('estimatedDuration', e.target.value)}
              margin="normal"
              helperText="ex.: 3 meses"
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/proposals')}>Cancelar</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
