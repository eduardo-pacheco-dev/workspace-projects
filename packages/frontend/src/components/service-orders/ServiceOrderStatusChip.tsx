import StatusChip from '../ui/StatusChip'
import { statusLabels, statusColors } from '../../pages/service-orders/serviceOrdersTypes'

interface ServiceOrderStatusChipProps {
  status: string
}

export default function ServiceOrderStatusChip({ status }: ServiceOrderStatusChipProps) {
  return <StatusChip value={status} labels={statusLabels} colors={statusColors} />
}
