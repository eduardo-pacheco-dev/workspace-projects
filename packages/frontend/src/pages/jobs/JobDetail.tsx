import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, CircularProgress, Container, Grid, Paper, Stack, Typography } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import InfoItem from '../../components/ui/InfoItem'
import StatusChip from '../../components/ui/StatusChip'
import JobModal from './JobModal'
import { Job, jobStatusLabels, jobStatusColors, formatJobDate } from './jobsTypes'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const jobId = Number(id)

  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [toDelete, setToDelete] = useState(false)
  const [toRun, setToRun] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.get(`/jobs/${jobId}`)
      .then((res) => setJob(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar o job.'))
      .finally(() => setLoading(false))
  }, [jobId])

  useEffect(() => {
    load()
  }, [load])

  const handleRun = async () => {
    setToRun(false)
    try {
      const res = await api.post(`/jobs/${jobId}/run`)
      showToast(`Job "${res.data.nome}" executado com sucesso.`)
      load()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível executar o job.', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/jobs/${jobId}`)
      showToast('Job excluído com sucesso.')
      navigate('/jobs')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir.', 'error')
    }
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error && !job) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (!job) return null

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5">{job.nome}</Typography>
              <StatusChip value={job.status} labels={jobStatusLabels} colors={jobStatusColors} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tipo: {job.tipo}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => setToRun(true)}
              disabled={job.status === 'executando'}
            >
              Executar agora
            </Button>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setToDelete(true)}>
              Excluir
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <InfoItem label="Expressão Cron" value={job.cronExpression} md={6} />
          <InfoItem label="Descrição" value={job.descricao} md={6} />
          <InfoItem label="Última execução" value={formatJobDate(job.ultimoExecutadoEm)} md={6} />
          <InfoItem label="Próxima execução" value={formatJobDate(job.proximaExecucaoEm)} md={6} />
          <InfoItem label="Criado em" value={formatJobDate(job.createdAt)} md={6} />
          <InfoItem label="Atualizado em" value={formatJobDate(job.updatedAt)} md={6} />
        </Grid>
      </Paper>

      <JobModal
        open={editOpen}
        editId={jobId}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false)
          load()
        }}
      />

      <ConfirmDialog
        open={toRun}
        title="Executar job"
        message={`Deseja executar agora o job "${job.nome}"?`}
        confirmLabel="Executar"
        onClose={() => setToRun(false)}
        onConfirm={handleRun}
      />

      <ConfirmDialog
        open={toDelete}
        title="Excluir job"
        message={`Tem certeza que deseja excluir o job "${job.nome}"?`}
        onClose={() => setToDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}