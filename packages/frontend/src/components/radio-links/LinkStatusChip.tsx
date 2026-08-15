import ActiveStatusChip from '../ui/ActiveStatusChip'

interface LinkStatusChipProps {
  status: string
}

export default function LinkStatusChip({ status }: LinkStatusChipProps) {
  return <ActiveStatusChip status={status} />
}
