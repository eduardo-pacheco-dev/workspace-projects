import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

interface TasksToolbarProps {
  total: number
  openCount: number
  onNew: () => void
}

export default function TasksToolbar({ total, openCount, onNew }: TasksToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Box>
        <Typography variant="h4">Tarefas</Typography>
        <Typography variant="body2" color="text.secondary">
          {total} tarefa(s) · {openCount} abertas
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<Add />} onClick={onNew}>
        Nova Tarefa
      </Button>
    </Box>
  )
}
