import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, Chip, Container, CircularProgress, Grid, IconButton, Paper, Typography } from '@mui/material'
import { ArrowBack, Edit } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import InfoItem from '../../components/ui/InfoItem'
import JobStatusChip from '../../components/jobs/JobStatusChip'
import JobAttachmentsSection from '../../components/jobs/JobAttachmentsSection'
import JobCommentsSection from '../../components/jobs/JobCommentsSection'
import { Job, expLevelLabels, parseSkills, formatBudget } from './jobsTypes'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!job) return <Container sx={{ mt: 4 }}><Alert severity="warning">Job não encontrado.</Alert></Container>

  const skills = parseSkills(job.skills)

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/collaborators?tab=3')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes do Job</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => navigate('/collaborators?tab=3')}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4">{job.title}</Typography>
            <JobStatusChip status={job.status} />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <InfoItem label="Orçamento" value={formatBudget(job.budget, job.budgetType)} md={6} />
          <InfoItem label="Nível de Experiência" value={expLevelLabels[job.experienceLevel] || job.experienceLevel} md={6} />
          <InfoItem label="Cliente" value={job.clientId || '-'} md={6} />
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Box sx={{ mt: 0.5 }}>
              <JobStatusChip status={job.status} />
            </Box>
          </Grid>
          <InfoItem label="Descrição" value={job.description || '-'} md={12} />
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Habilidades</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {skills.length > 0
                ? skills.map((skill) => <Chip key={skill} label={skill} size="small" variant="outlined" color="primary" />)
                : <Typography variant="body2" color="text.secondary">Nenhuma habilidade cadastrada</Typography>
              }
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <JobAttachmentsSection jobId={job.id} onError={setError} />

      <JobCommentsSection jobId={job.id} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/collaborators?tab=3')}>
          Voltar para a Lista
        </Button>
      </Box>
    </Container>
  )
}
