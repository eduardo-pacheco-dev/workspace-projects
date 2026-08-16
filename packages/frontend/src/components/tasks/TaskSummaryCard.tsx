import { Avatar, Box, Grid, Paper, Stack, Typography } from '@mui/material'
import { Task, statusLabels, priorityLabels, formatDateTime } from '../../pages/tasks/tasksTypes'
import Markdown from '../Markdown'
import TaskStatusChip from './TaskStatusChip'
import TaskPriorityChip from './TaskPriorityChip'
import InfoItem from '../ui/InfoItem'
import { getInitials } from '../../utils/format'

interface TaskSummaryCardProps {
  task: Task
}

export default function TaskSummaryCard({ task }: TaskSummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}
    >
      <Box sx={{ bgcolor: 'rgb(0, 21, 68)', px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            width: 48,
            height: 48,
            fontWeight: 700,
          }}
        >
          {getInitials(task.title)}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
            {task.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <TaskStatusChip status={task.status} />
            <TaskPriorityChip priority={task.priority} variant="outlined" />
          </Stack>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              Descrição
            </Typography>
            <Box sx={{ pt: 0.5 }}>
              <Markdown>{task.description}</Markdown>
            </Box>
          </Grid>
          <InfoItem label="Status" value={statusLabels[task.status] || task.status} md={4} />
          <InfoItem label="Prioridade" value={priorityLabels[task.priority] || task.priority} md={4} />
          <InfoItem label="Vencimento" value={formatDateTime(task.dueAt)} md={4} />
          <InfoItem label="Projeto" value={task.project} md={4} />
          <InfoItem label="Cliente" value={task.client} md={4} />
          <InfoItem label="Responsável" value={task.assignedTo} md={4} />
          <InfoItem
            label="Criada em"
            value={task.createdAt ? new Date(task.createdAt).toLocaleString('pt-BR') : undefined}
            md={4}
          />
          <InfoItem
            label="Atualizada em"
            value={task.updatedAt ? new Date(task.updatedAt).toLocaleString('pt-BR') : undefined}
            md={4}
          />
        </Grid>
      </Box>
    </Paper>
  )
}
