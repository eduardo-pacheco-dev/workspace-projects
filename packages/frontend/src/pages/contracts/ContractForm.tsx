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

export default function ContractForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [proposalId, setProposalId] = useState('')
  const [jobId, setJobId] = useState('')
  const [freelancerId, setFreelancerId] = useState('')
  const [clientId, setClientId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/contracts/${id}`)
        .then((res) => {
          const data = res.data
          setProposalId(data.proposalId ? String(data.proposalId) : '')
          setJobId(String(data.jobId || ''))
          setFreelancerId(String(data.freelancerId || ''))
          setClientId(String(data.clientId || ''))
          setStartDate(data.startDate ? data.startDate.slice(0, 10) : '')
          setEndDate(data.endDate ? data.endDate.slice(0, 10) : '')
          setTotalBudget(data.totalBudget ? String(data.totalBudget) : '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [id, isEdit])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload: Record<string, any> = {
      proposalId: proposalId ? Number(proposalId) : undefined,
      jobId: Number(jobId),
      freelancerId: Number(freelancerId),
      clientId: Number(clientId),
      startDate,
      endDate: endDate || undefined,
      totalBudget: Number(totalBudget),
    }

    if (!isEdit) {
      payload.status = 'active'
    }

    try {
      if (isEdit) {
        await api.patch(`/contracts/${id}`, payload)
      } else {
        await api.post('/contracts', payload)
      }
      navigate('/contracts')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{isEdit ? 'Edit Contract' : 'New Contract'}</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Proposal ID" type="number" value={proposalId} onChange={(e) => setProposalId(e.target.value)} margin="normal" />
            <TextField fullWidth label="Job ID" type="number" value={jobId} onChange={(e) => setJobId(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Freelancer ID" type="number" value={freelancerId} onChange={(e) => setFreelancerId(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Client ID" type="number" value={clientId} onChange={(e) => setClientId(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} margin="normal" required InputLabelProps={{ shrink: true }} />
            <TextField fullWidth label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField fullWidth label="Total Budget" type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} margin="normal" required />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Update' : 'Create')}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/contracts')}>Cancel</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
