import StatusChip from '../ui/StatusChip'
import { entryTypeLabels, entryTypeColors } from '../../pages/finance/financeTypes'

interface EntryTypeChipProps {
  type: string
}

export default function EntryTypeChip({ type }: EntryTypeChipProps) {
  return <StatusChip value={type} labels={entryTypeLabels} colors={entryTypeColors} />
}
