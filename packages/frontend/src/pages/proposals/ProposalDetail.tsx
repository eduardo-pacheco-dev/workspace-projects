import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material'
import api from '../../services/api'

interface Proposal {
  id: number
  jobId: number
  freelancerId: number
  coverLetter: string
  proposedRate: number
  estimatedDuration: string
  status: string
}

export default function ProposalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/proposals/${id}`)
      .then((res) => setProposal(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!proposal) return <Container sx={{ mt: 4 }}><Alert severity="warning">Proposal not found.</Alert></Container>

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Proposal Detail</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <Typography><strong>ID:</strong> {proposal.id}</Typography>
            <Typography><strong>Job ID:</strong> {proposal.jobId}</Typography>
            <Typography><strong>Freelancer ID:</strong> {proposal.freelancerId}</Typography>
            <Typography><strong>Cover Letter:</strong> {proposal.coverLetter || '-'}</Typography>
            <Typography><strong>Proposed Rate:</strong> ${proposal.proposedRate}</Typography>
            <Typography><strong>Estimated Duration:</strong> {proposal.estimatedDuration || '-'}</Typography>
            <Typography><strong>Status:</strong> {proposal.status}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => navigate(`/proposals/${id}/edit`)}>Edit</Button>
            <Button variant="outlined" onClick={() => navigate('/proposals')}>Back to List</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
