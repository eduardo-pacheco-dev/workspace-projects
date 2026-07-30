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
  Chip,
} from '@mui/material'
import api from '../../services/api'

interface Job {
  id: number
  title: string
  description: string
  budget: number
  budgetType: string
  status: string
  skills: string[]
  experienceLevel: string
  clientId: number
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error loading job.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!job) return <Container sx={{ mt: 4 }}><Alert severity="warning">Job not found.</Alert></Container>

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Job Detail</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <Typography><strong>ID:</strong> {job.id}</Typography>
            <Typography><strong>Title:</strong> {job.title}</Typography>
            <Typography><strong>Description:</strong> {job.description || '-'}</Typography>
            <Typography><strong>Budget:</strong> ${job.budget}</Typography>
            <Typography><strong>Budget Type:</strong> {job.budgetType}</Typography>
            <Typography><strong>Status:</strong> {job.status}</Typography>
            <Typography><strong>Experience Level:</strong> {job.experienceLevel}</Typography>
            <Typography><strong>Client ID:</strong> {job.clientId}</Typography>
            <Typography><strong>Skills:</strong> {Array.isArray(job.skills) ? job.skills.map((s) => <Chip key={s} label={s} size="small" sx={{ mr: 0.5, mb: 0.5 }} />) : job.skills}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => navigate(`/jobs/${id}/edit`)}>Edit</Button>
            <Button variant="outlined" onClick={() => navigate('/jobs')}>Back to List</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
