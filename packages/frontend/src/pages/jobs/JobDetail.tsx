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
  Divider,
  IconButton,
} from '@mui/material'
import { ArrowBack, Edit } from '@mui/icons-material'
import api from '../../services/api'

interface Job {
  id: number
  title: string
  description: string
  budget: number
  budgetType: string
  status: string
  skills: string
  experienceLevel: string
  clientId: string
}

const statusMap: Record<string, { label: string; color: 'info' | 'warning' | 'success' | 'error' }> = {
  open: { label: 'Aberto', color: 'info' },
  in_progress: { label: 'Em Andamento', color: 'warning' },
  completed: { label: 'Concluído', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'error' },
}

const expLevelMap: Record<string, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Lead',
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
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!job) return <Container sx={{ mt: 4 }}><Alert severity="warning">Job não encontrado.</Alert></Container>

  const statusInfo = statusMap[job.status] || { label: job.status, color: 'info' as const }
  const skills = typeof job.skills === 'string'
    ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : job.skills

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/freelancers?tab=1')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes do Job</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => navigate('/freelancers?tab=1')}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4">{job.title}</Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Orçamento</Typography>
            <Typography variant="body1" gutterBottom>${job.budget} ({job.budgetType === 'hourly' ? 'Por Hora' : 'Fixo'})</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Nível de Experiência</Typography>
            <Typography variant="body1" gutterBottom>{expLevelMap[job.experienceLevel] || job.experienceLevel}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
            <Typography variant="body1" gutterBottom>{job.clientId || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
            <Typography variant="body1" gutterBottom>{job.description || '-'}</Typography>
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
        <Button variant="outlined" onClick={() => navigate('/freelancers?tab=1')}>
          Voltar para a Lista
        </Button>
      </Box>
    </Container>
  )
}
