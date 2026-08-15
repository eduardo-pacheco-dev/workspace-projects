import { Chip } from '@mui/material'
import { priorityLabels, priorityColors } from '../../pages/tasks/tasksTypes'

interface TaskPriorityChipProps {
  priority: string
  variant?: 'filled' | 'outlined'
}

export default function TaskPriorityChip({ priority, variant }: TaskPriorityChipProps) {
  return (
    <Chip
      size="small"
      variant={variant}
      label={priorityLabels[priority] || priority}
      color={priorityColors[priority] || 'default'}
    />
  )
}
