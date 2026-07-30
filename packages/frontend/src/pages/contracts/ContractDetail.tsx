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

interface Contract {
  id: number
  proposalId?: number
  jobId: number
  freelancerId: number
  clientId: number
  startDate: string
  endDate?: string
  totalBudget: number
  status: string
}

export default function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState<Contract | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/contracts/${id}`)
      .then((res) => setContract(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error loading contract.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!contract) return <Container sx={{ mt: 4 }}><Alert severity="warning">Contract not found.</Alert></Container>

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Contract Detail</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <Typography><strong>ID:</strong> {contract.id}</Typography>
            <Typography><strong>Proposal ID:</strong> {contract.proposalId || '-'}</Typography>
            <Typography><strong>Job ID:</strong> {contract.jobId}</Typography>
            <Typography><strong>Freelancer ID:</strong> {contract.freelancerId}</Typography>
            <Typography><strong>Client ID:</strong> {contract.clientId}</Typography>
            <Typography><strong>Start Date:</strong> {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'}</Typography>
            <Typography><strong>End Date:</strong> {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '-'}</Typography>
            <Typography><strong>Total Budget:</strong> ${contract.totalBudget}</Typography>
            <Typography><strong>Status:</strong> {contract.status}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => navigate(`/contracts/${id}/edit`)}>Edit</Button>
            <Button variant="outlined" onClick={() => navigate('/contracts')}>Back to List</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
