import { Chip } from '@mui/material'
import { contractStatusLabels, contractStatusColors } from '../../pages/contracts/contractsTypes'

interface ContractStatusChipProps {
  status: string
}

export default function ContractStatusChip({ status }: ContractStatusChipProps) {
  return (
    <Chip
      size="small"
      label={contractStatusLabels[status] || status}
      color={contractStatusColors[status] || 'default'}
    />
  )
}
