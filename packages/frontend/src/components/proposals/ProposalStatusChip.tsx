import StatusChip from '../ui/StatusChip'
import { proposalStatusLabels, proposalStatusColors } from '../../pages/proposals/proposalsTypes'

interface ProposalStatusChipProps {
  status: string
}

export default function ProposalStatusChip({ status }: ProposalStatusChipProps) {
  return <StatusChip value={status} labels={proposalStatusLabels} colors={proposalStatusColors} />
}
