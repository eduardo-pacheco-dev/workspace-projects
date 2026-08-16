import { MenuItem, Paper, Stack, TextField } from '@mui/material'
import { statusOptions, priorityOptions } from '../../pages/tasks/tasksTypes'

interface TasksFiltersProps {
  search: string
  status: string
  priority: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
}

export default function TasksFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: TasksFiltersProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <TextField
          size="small"
          select
          label="Status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Prioridade"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {priorityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
      </Stack>
    </Paper>
  )
}
