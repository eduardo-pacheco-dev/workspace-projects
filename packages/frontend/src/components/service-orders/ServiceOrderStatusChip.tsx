import { Chip } from '@mui/material'
import { statusLabels, statusColors } from '../../pages/service-orders/serviceOrdersTypes'

interface ServiceOrderStatusChipProps {
  status: string
}

export default function ServiceOrderStatusChip({ status }: ServiceOrderStatusChipProps) {
  return (
    <Chip
      size="small"
      label={statusLabels[status] || status}
      color={statusColors[status] || 'default'}
    />
  )
}
