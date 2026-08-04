import { useState, useEffect, useCallback } from 'react'
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
  Stack,
} from '@mui/material'
import { ArrowBack, Edit, Assignment } from '@mui/icons-material'
import api from '../../services/api'
import TaskModal from './TaskModal'
import {
  Task,
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
  formatDateTime,
} from './tasksTypes'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.get(`/tasks/${id}`)
      .then((res) => setTask(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!task) return <Container sx={{ mt: 4 }}><Alert severity="warning">Tarefa não encontrada.</Alert></Container>

  const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" gutterBottom>{value || '-'}</Typography>
    </Grid>
  )

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/tasks')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes da Tarefa</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => setModalOpen(true)}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1976d2, #42a5f5)', color: 'white' }}>
            <Assignment fontSize="large" />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 200 }}>
            <Typography variant="h4">{task.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                size="small"
                label={statusLabels[task.status] || task.status}
                color={statusColors[task.status] || 'default'}
              />
              <Chip
                size="small"
                label={priorityLabels[task.priority] || task.priority}
                color={priorityColors[task.priority] || 'default'}
                variant="outlined"
              />
            </Stack>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
            <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
              {task.description || '-'}
            </Typography>
          </Grid>
          <InfoItem label="Status" value={statusLabels[task.status] || task.status} />
          <InfoItem label="Prioridade" value={priorityLabels[task.priority] || task.priority} />
          <InfoItem label="Vencimento" value={formatDateTime(task.dueAt)} />
          <InfoItem label="Projeto" value={task.project} />
          <InfoItem label="Cliente" value={task.client} />
          <InfoItem label="Responsável" value={task.assignedTo} />
          <InfoItem label="Criada em" value={task.createdAt ? new Date(task.createdAt).toLocaleString('pt-BR') : undefined} />
          <InfoItem label="Atualizada em" value={task.updatedAt ? new Date(task.updatedAt).toLocaleString('pt-BR') : undefined} />
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/tasks')}>
          Voltar para a Lista
        </Button>
      </Box>

      <TaskModal
        open={modalOpen}
        editId={Number(id)}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </Container>
  )
}
