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

interface Freelancer {
  id: number
  userId: number
  firstName: string
  lastName: string
  bio: string
  hourlyRate: number
  skills: string[]
  experienceLevel: string
  availability: string
}

export default function FreelancerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/freelancers/${id}`)
      .then((res) => setFreelancer(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!freelancer) return <Container sx={{ mt: 4 }}><Alert severity="warning">Freelancer not found.</Alert></Container>

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Freelancer Detail</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <Typography><strong>ID:</strong> {freelancer.id}</Typography>
            <Typography><strong>User ID:</strong> {freelancer.userId}</Typography>
            <Typography><strong>Nome:</strong> {freelancer.firstName} {freelancer.lastName}</Typography>
            <Typography><strong>Bio:</strong> {freelancer.bio || '-'}</Typography>
            <Typography><strong>Hourly Rate:</strong> ${freelancer.hourlyRate}</Typography>
            <Typography><strong>Skills:</strong> {Array.isArray(freelancer.skills) ? freelancer.skills.map((s) => <Chip key={s} label={s} size="small" sx={{ mr: 0.5, mb: 0.5 }} />) : freelancer.skills}</Typography>
            <Typography><strong>Experience Level:</strong> {freelancer.experienceLevel}</Typography>
            <Typography><strong>Availability:</strong> {freelancer.availability}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => navigate('/freelancers')}>Editar</Button>
            <Button variant="outlined" onClick={() => navigate('/freelancers')}>Back to List</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
