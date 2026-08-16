import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, Container } from '@mui/material'
import { ArrowBack, Edit } from '@mui/icons-material'
import api from '../../services/api'
import ErrorState from '../../components/ui/ErrorState'
import PageLoader from '../../components/ui/PageLoader'
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

  if (loading) return <Container sx={{ mt: 4 }}><PageLoader py={10} /></Container>
  if (error) return <Container sx={{ mt: 4 }}><ErrorState message={error} /></Container>
  if (!task) return <Container sx={{ mt: 4 }}><ErrorState message="Tarefa não encontrada." severity="warning" /></Container>

  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/tasks')}>
          Voltar
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<Edit />} onClick={() => setModalOpen(true)}>
          Editar
        </Button>
      </Box>

      <TaskSummaryCard task={task} />

      <Box sx={{ mt: 3 }}>
        <SubtasksSection
          taskId={task.id}
          subtasks={task.subtasks ?? []}
          onSubtasksChange={handleSubtasksChange}
          onError={setError}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <AttachmentsSection taskId={task.id} onError={setError} />
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
