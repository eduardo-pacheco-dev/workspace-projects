import { Chip } from '@mui/material'
import { statusLabels, statusColors } from '../../pages/tasks/tasksTypes'

interface TaskStatusChipProps {
  status: string
  variant?: 'filled' | 'outlined'
}

export default function TaskStatusChip({ status, variant }: TaskStatusChipProps) {
  return (
    <Chip
      size="small"
      variant={variant}
      label={statusLabels[status] || status}
      color={statusColors[status] || 'default'}
    />
  )
}
