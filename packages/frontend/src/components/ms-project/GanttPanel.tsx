import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import GanttChart from '../../pages/ms-project/GanttChart'
import { MsProjectDetail } from '../../pages/ms-project/msProjectTypes'

interface GanttPanelProps {
  plan: MsProjectDetail
  onNewTask: () => void
  onNewResource: () => void
}

export default function GanttPanel({ plan, onNewTask, onNewResource }: GanttPanelProps) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Gráfico de Gantt</Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" startIcon={<Add />} onClick={onNewTask}>
            Nova Tarefa
          </Button>
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={onNewResource}>
            Novo Recurso
          </Button>
        </Stack>
      </Box>
      <GanttChart tasks={plan.tasks} dependencies={plan.dependencies} />
    </Paper>
  )
}
