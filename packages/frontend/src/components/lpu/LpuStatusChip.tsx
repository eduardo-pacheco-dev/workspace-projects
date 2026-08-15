import ActiveStatusChip from '../ui/ActiveStatusChip'

interface LpuStatusChipProps {
  status: string
}

export default function LpuStatusChip({ status }: LpuStatusChipProps) {
  return <ActiveStatusChip status={status} />
}
