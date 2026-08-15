import { Chip } from '@mui/material'
import { msProjectStatusLabels, msProjectStatusColors } from '../../pages/ms-project/msProjectTypes'

interface MsProjectStatusChipProps {
  status: string
}

export default function MsProjectStatusChip({ status }: MsProjectStatusChipProps) {
  return (
    <Chip
      size="small"
      label={msProjectStatusLabels[status] || status}
      color={msProjectStatusColors[status] || 'default'}
    />
  )
}
