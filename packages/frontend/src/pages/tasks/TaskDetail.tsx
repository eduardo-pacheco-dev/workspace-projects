import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Container, CircularProgress, IconButton, Typography } from '@mui/material'
import { ArrowBack, Edit } from '@mui/icons-material'
import api from '../../services/api'
import TaskModal from './TaskModal'
import TaskSummaryCard from '../../components/tasks/TaskSummaryCard'
import SubtasksSection from '../../components/tasks/SubtasksSection'
import AttachmentsSection from '../../components/tasks/AttachmentsSection'
import { Task } from './tasksTypes'

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

  const handleSubtasksChange = (subtasks: Task[]) => {
    setTask((prev) => (prev ? { ...prev, subtasks } : prev))
  }

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!task) return <Container sx={{ mt: 4 }}><Alert severity="warning">Tarefa não encontrada.</Alert></Container>

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

      <TaskSummaryCard task={task} />

      <SubtasksSection
        taskId={task.id}
        subtasks={task.subtasks ?? []}
        onSubtasksChange={handleSubtasksChange}
        onError={setError}
      />

      <AttachmentsSection taskId={task.id} onError={setError} />

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
