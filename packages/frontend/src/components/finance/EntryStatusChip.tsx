import { Chip } from '@mui/material'
import { entryStatusLabels, entryStatusColors } from '../../pages/finance/financeTypes'

interface EntryStatusChipProps {
  status: string
}

export default function EntryStatusChip({ status }: EntryStatusChipProps) {
  return (
    <Chip size="small" label={entryStatusLabels[status] || status} color={entryStatusColors[status] || 'default'} />
  )
}
