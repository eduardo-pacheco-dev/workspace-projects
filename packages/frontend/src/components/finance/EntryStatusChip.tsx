import StatusChip from '../ui/StatusChip'
import { entryStatusLabels, entryStatusColors } from '../../pages/finance/financeTypes'

interface EntryStatusChipProps {
  status: string
}

export default function EntryStatusChip({ status }: EntryStatusChipProps) {
  return <StatusChip value={status} labels={entryStatusLabels} colors={entryStatusColors} />
}
