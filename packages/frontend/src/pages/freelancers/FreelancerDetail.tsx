import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
  Chip,
  Paper,
  Grid,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material'
import { ArrowBack, Edit, Person } from '@mui/icons-material'
import api from '../../services/api'

interface Freelancer {
  id: number
  userId: number
  firstName: string
  lastName: string
  bio: string
  hourlyRate: number
  skills: string
  experienceLevel: string
  availability: string
}

const expLevelMap: Record<string, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Lead',
}

const availMap: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  available: { label: 'Disponível', color: 'success' },
  busy: { label: 'Ocupado', color: 'warning' },
  unavailable: { label: 'Indisponível', color: 'error' },
}

export default function FreelancerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/collaborators/${id}`)
      .then((res) => setFreelancer(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!freelancer) return <Container sx={{ mt: 4 }}><Alert severity="warning">Freelancer não encontrado.</Alert></Container>

  const skills = typeof freelancer.skills === 'string'
    ? freelancer.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : freelancer.skills

  const availInfo = availMap[freelancer.availability] || { label: freelancer.availability, color: 'warning' as const }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/collaborators')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes do Freelancer</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => navigate('/collaborators')}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h4">{freelancer.firstName} {freelancer.lastName}</Typography>
            <Chip
              label={availInfo.label}
              color={availInfo.color}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Nome</Typography>
            <Typography variant="body1" gutterBottom>{freelancer.firstName} {freelancer.lastName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Valor por Hora</Typography>
            <Typography variant="body1" gutterBottom>${freelancer.hourlyRate}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Nível de Experiência</Typography>
            <Typography variant="body1" gutterBottom>{expLevelMap[freelancer.experienceLevel] || freelancer.experienceLevel}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Disponibilidade</Typography>
            <Chip label={availInfo.label} color={availInfo.color} size="small" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
            <Typography variant="body1" gutterBottom>{freelancer.bio || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Habilidades</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {skills.length > 0
                ? skills.map((s) => <Chip key={s} label={s} size="small" variant="outlined" color="primary" />)
                : <Typography variant="body2" color="text.secondary">Nenhuma habilidade cadastrada</Typography>
              }
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/collaborators')}>
          Voltar para a Lista
        </Button>
      </Box>
    </Container>
  )
}
