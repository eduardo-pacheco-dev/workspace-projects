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

export default function ProposalForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [jobId, setJobId] = useState('')
  const [freelancerId, setFreelancerId] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/proposals/${id}`)
        .then((res) => {
          const data = res.data
          setJobId(String(data.jobId || ''))
          setFreelancerId(String(data.freelancerId || ''))
          setCoverLetter(data.coverLetter || '')
          setProposedRate(data.proposedRate ? String(data.proposedRate) : '')
          setEstimatedDuration(data.estimatedDuration || '')
        })
        .catch((err) => setError(err.response?.data?.message || 'Error loading proposal.'))
    }
  }, [id, isEdit])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload: Record<string, any> = {
      jobId: Number(jobId),
      freelancerId: Number(freelancerId),
      coverLetter,
      proposedRate: Number(proposedRate),
      estimatedDuration,
    }

    if (!isEdit) {
      payload.status = 'pending'
    }

    try {
      if (isEdit) {
        await api.patch(`/proposals/${id}`, payload)
      } else {
        await api.post('/proposals', payload)
      }
      navigate('/proposals')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving proposal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{isEdit ? 'Edit Proposal' : 'New Proposal'}</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Job ID" type="number" value={jobId} onChange={(e) => setJobId(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Freelancer ID" type="number" value={freelancerId} onChange={(e) => setFreelancerId(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Cover Letter" multiline rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} margin="normal" />
            <TextField fullWidth label="Proposed Rate" type="number" value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Estimated Duration" value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} margin="normal" helperText="e.g. 3 months" />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Update' : 'Create')}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/proposals')}>Cancel</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
