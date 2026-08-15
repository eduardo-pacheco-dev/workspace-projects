import { Chip } from '@mui/material'
import { statusLabels, statusColors } from '../../pages/schedule/scheduleTypes'

interface ScheduleStatusChipProps {
  status: string
}

export default function ScheduleStatusChip({ status }: ScheduleStatusChipProps) {
  return (
    <Chip
      size="small"
      label={statusLabels[status] || status}
      color={statusColors[status] || 'default'}
    />
  )
}
