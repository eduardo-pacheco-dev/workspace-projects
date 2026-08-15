import StatusChip from '../ui/StatusChip'
import { priorityLabels, priorityColors } from '../../pages/tasks/tasksTypes'

interface TaskPriorityChipProps {
  priority: string
  variant?: 'filled' | 'outlined'
}

export default function TaskPriorityChip({ priority, variant }: TaskPriorityChipProps) {
  return <StatusChip value={priority} labels={priorityLabels} colors={priorityColors} variant={variant} />
}
