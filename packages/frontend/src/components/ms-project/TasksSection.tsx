import { useState } from 'react'
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Delete, Edit } from '@mui/icons-material'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import ConfirmDialog from '../ConfirmDialog'
import { MsProjectDetail, MsTask, taskPriorityLabels, taskPriorityColors, formatDate, taskAssignments } from '../../pages/ms-project/msProjectTypes'

interface TasksSectionProps {
  plan: MsProjectDetail
  onReload: () => void
  onEdit: (task: MsTask) => void
}

export default function TasksSection({ plan, onReload, onEdit }: TasksSectionProps) {
  const { showToast } = useToast()
  const [toDelete, setToDelete] = useState<MsTask | null>(null)

  const handleDelete = async (task: MsTask) => {
    try {
      await api.delete(`/ms-project/tasks/${task.id}`)
      onReload()
      showToast('Tarefa excluída com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir a tarefa.', 'error')
      setToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Tarefas</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Duração</TableCell>
              <TableCell>% Concl.</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Término</TableCell>
              <TableCell>Folga</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Recursos</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plan.tasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell>{task.position}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: task.critical ? 700 : 400 }}>
                      {task.milestone ? `◆ ${task.name}` : task.name}
                    </Typography>
                    {task.critical && <Chip size="small" color="error" label="crítica" />}
                  </Stack>
                </TableCell>
                <TableCell>{task.milestone ? 'Marco' : `${task.durationDays} d`}</TableCell>
                <TableCell>{task.percentComplete}%</TableCell>
                <TableCell>{formatDate(task.startDate)}</TableCell>
                <TableCell>{formatDate(task.finishDate)}</TableCell>
                <TableCell>{task.slackDays ?? '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={taskPriorityLabels[task.priority] || task.priority}
                    color={taskPriorityColors[task.priority] || 'default'}
                  />
                </TableCell>
                <TableCell>{taskAssignments(plan.assignments, plan.resources, task.id)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" onClick={() => onEdit(task)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setToDelete(task)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {plan.tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Nenhuma tarefa cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${toDelete?.name}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />
    </Paper>
  )
}
