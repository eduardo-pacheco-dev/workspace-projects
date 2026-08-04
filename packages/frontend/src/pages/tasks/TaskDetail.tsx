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
  TextField,
  Checkbox,
} from '@mui/material'
import { ArrowBack, Edit, Assignment, Add, Delete } from '@mui/icons-material'
import api from '../../services/api'
import TaskModal from './TaskModal'
import Markdown from '../../components/Markdown'
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
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.get(`/tasks/${id}`)
      .then((res) => setTask(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  const reloadSubtasks = useCallback(() => {
    api.get(`/tasks/${id}/subtasks`)
      .then((res) => {
        setTask((prev) => (prev ? { ...prev, subtasks: res.data ?? [] } : prev))
      })
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar as subtarefas.'))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const addSubtask = async () => {
    if (!subtaskTitle.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/tasks', { title: subtaskTitle.trim(), parentId: Number(id) })
      setSubtaskTitle('')
      await reloadSubtasks()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível adicionar a subtarefa.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSubtask = async (sub: Task) => {
    try {
      await api.patch(`/tasks/${sub.id}`, { status: sub.status === 'completed' ? 'pending' : 'completed' })
      await reloadSubtasks()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível atualizar a subtarefa.')
    }
  }

  const deleteSubtask = async (subId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta subtarefa?')) return
    try {
      await api.delete(`/tasks/${subId}`)
      await reloadSubtasks()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir a subtarefa.')
    }
  }

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
            <Box sx={{ pt: 0.5 }}>
              <Markdown>{task.description}</Markdown>
            </Box>
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

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Subtarefas ({task.subtasks?.length ?? 0})
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Nova subtarefa"
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
            disabled={submitting}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={addSubtask}
            disabled={submitting || !subtaskTitle.trim()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Adicionar
          </Button>
        </Box>

        {!task.subtasks || task.subtasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma subtarefa cadastrada.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {task.subtasks.map((sub) => {
              const info = { label: statusLabels[sub.status] || sub.status, color: (statusColors[sub.status] || 'default') as any }
              return (
                <Box
                  key={sub.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={sub.status === 'completed'}
                    onChange={() => toggleSubtask(sub)}
                  />
                  <Typography
                    variant="body1"
                    sx={{ flexGrow: 1, textDecoration: sub.status === 'completed' ? 'line-through' : 'none', color: sub.status === 'completed' ? 'text.secondary' : 'inherit' }}
                  >
                    {sub.title}
                  </Typography>
                  <Chip size="small" label={info.label} color={info.color} />
                  <IconButton size="small" onClick={() => deleteSubtask(sub.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )
            })}
          </Stack>
        )}
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
