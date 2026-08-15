import StatusChip from '../ui/StatusChip'
import { statusLabels, statusColors } from '../../pages/tasks/tasksTypes'

interface TaskStatusChipProps {
  status: string
  variant?: 'filled' | 'outlined'
}

export default function TaskStatusChip({ status, variant }: TaskStatusChipProps) {
  return <StatusChip value={status} labels={statusLabels} colors={statusColors} variant={variant} />
}
