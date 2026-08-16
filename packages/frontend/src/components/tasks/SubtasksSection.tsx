import { useState, useCallback } from 'react'
import { Box, Checkbox, Divider, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import DeleteModal from '../modals/DeleteModal'
import { Task } from '../../pages/tasks/tasksTypes'
import TaskStatusChip from './TaskStatusChip'

interface SubtasksSectionProps {
  taskId: number
  subtasks: Task[]
  onSubtasksChange: (subtasks: Task[]) => void
  onError: (message: string) => void
}

export default function SubtasksSection({ taskId, subtasks, onSubtasksChange, onError }: SubtasksSectionProps) {
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toDelete, setToDelete] = useState<Task | null>(null)

  const reload = useCallback(async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/subtasks`)
      onSubtasksChange(res.data ?? [])
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível carregar as subtarefas.')
    }
  }, [taskId, onSubtasksChange, onError])

  const addSubtask = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await api.post('/tasks', { title: title.trim(), parentId: taskId })
      setTitle('')
      await reload()
      showToast('Subtarefa adicionada com sucesso.')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível adicionar a subtarefa.'
      onError(message)
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSubtask = async (subtask: Task) => {
    try {
      await api.patch(`/tasks/${subtask.id}`, { status: subtask.status === 'completed' ? 'pending' : 'completed' })
      await reload()
      showToast(subtask.status === 'completed' ? 'Subtarefa reaberta.' : 'Subtarefa concluída.')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível atualizar a subtarefa.'
      onError(message)
      showToast(message, 'error')
    }
  }

  const deleteSubtask = async (subtaskId: number) => {
    try {
      await api.delete(`/tasks/${subtaskId}`)
      await reload()
      showToast('Subtarefa excluída com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir a subtarefa.'
      onError(message)
      showToast(message, 'error')
      setToDelete(null)
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)', mb: 2 }}>
        Subtarefas ({subtasks?.length ?? 0})
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Nova subtarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
          disabled={submitting}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={addSubtask}
          disabled={submitting || !title.trim()}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Adicionar
        </Button>
      </Box>

      {!subtasks || subtasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma subtarefa cadastrada.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {subtasks.map((subtask) => (
            <Box
              key={subtask.id}
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
                checked={subtask.status === 'completed'}
                onChange={() => toggleSubtask(subtask)}
              />
              <Typography
                variant="body1"
                sx={{
                  flexGrow: 1,
                  textDecoration: subtask.status === 'completed' ? 'line-through' : 'none',
                  color: subtask.status === 'completed' ? 'text.secondary' : 'inherit',
                }}
              >
                {subtask.title}
              </Typography>
              <TaskStatusChip status={subtask.status} />
              <IconButton size="small" color="error" onClick={() => setToDelete(subtask)}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      <DeleteModal
        open={Boolean(toDelete)}
        title="Excluir subtarefa"
        message={`Tem certeza que deseja excluir a subtarefa "${toDelete?.title}"? Esta ação não poderá ser desfeita.`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteSubtask(toDelete.id)}
      />
    </Paper>
  )
}
