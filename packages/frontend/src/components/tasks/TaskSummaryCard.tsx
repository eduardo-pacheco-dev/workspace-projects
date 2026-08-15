import { Box, Divider, Grid, Paper, Stack, Typography } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import { Task, statusLabels, priorityLabels, formatDateTime } from '../../pages/tasks/tasksTypes'
import Markdown from '../Markdown'
import TaskStatusChip from './TaskStatusChip'
import TaskPriorityChip from './TaskPriorityChip'
import InfoItem from './InfoItem'

interface TaskSummaryCardProps {
  task: Task
}

export default function TaskSummaryCard({ task }: TaskSummaryCardProps) {
  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            color: 'white',
          }}
        >
          <AssignmentIcon fontSize="large" />
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 200 }}>
          <Typography variant="h4">{task.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <TaskStatusChip status={task.status} />
            <TaskPriorityChip priority={task.priority} variant="outlined" />
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
  )
}
