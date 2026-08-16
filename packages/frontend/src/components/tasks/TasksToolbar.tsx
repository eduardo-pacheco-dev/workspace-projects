import { Box, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import Button from '../ui/Button'

interface TasksToolbarProps {
  total: number
  openCount: number
  onNew: () => void
}

export default function TasksToolbar({ total, openCount, onNew }: TasksToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Tarefas</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {total} tarefa(s) · {openCount} aberta(s)
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" startIcon={<Add />} onClick={onNew}>
          Nova Tarefa
        </Button>
      </Box>
    </Box>
  )
}
