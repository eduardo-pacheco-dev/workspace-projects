import { Chip } from '@mui/material'
import { proposalStatusLabels, proposalStatusColors } from '../../pages/proposals/proposalsTypes'

interface ProposalStatusChipProps {
  status: string
}

export default function ProposalStatusChip({ status }: ProposalStatusChipProps) {
  return (
    <Chip
      size="small"
      label={proposalStatusLabels[status] || status}
      color={proposalStatusColors[status] || 'default'}
    />
  )
}
