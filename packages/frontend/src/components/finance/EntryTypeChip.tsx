import { Chip } from '@mui/material'
import { entryTypeLabels, entryTypeColors } from '../../pages/finance/financeTypes'

interface EntryTypeChipProps {
  type: string
}

export default function EntryTypeChip({ type }: EntryTypeChipProps) {
  return (
    <Chip size="small" label={entryTypeLabels[type] || type} color={entryTypeColors[type] || 'default'} />
  )
}
