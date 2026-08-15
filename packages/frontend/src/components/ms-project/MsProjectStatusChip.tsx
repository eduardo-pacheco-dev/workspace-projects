import StatusChip from '../ui/StatusChip'
import { msProjectStatusLabels, msProjectStatusColors } from '../../pages/ms-project/msProjectTypes'

interface MsProjectStatusChipProps {
  status: string
}

export default function MsProjectStatusChip({ status }: MsProjectStatusChipProps) {
  return <StatusChip value={status} labels={msProjectStatusLabels} colors={msProjectStatusColors} />
}
