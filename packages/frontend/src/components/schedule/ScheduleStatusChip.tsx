import StatusChip from '../ui/StatusChip'
import { statusLabels, statusColors } from '../../pages/schedule/scheduleTypes'

interface ScheduleStatusChipProps {
  status: string
}

export default function ScheduleStatusChip({ status }: ScheduleStatusChipProps) {
  return <StatusChip value={status} labels={statusLabels} colors={statusColors} />
}
