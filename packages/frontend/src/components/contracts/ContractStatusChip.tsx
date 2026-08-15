import StatusChip from '../ui/StatusChip'
import { contractStatusLabels, contractStatusColors } from '../../pages/contracts/contractsTypes'

interface ContractStatusChipProps {
  status: string
}

export default function ContractStatusChip({ status }: ContractStatusChipProps) {
  return <StatusChip value={status} labels={contractStatusLabels} colors={contractStatusColors} />
}
