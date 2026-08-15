import ActiveStatusChip from '../ui/ActiveStatusChip'

interface ClientStatusChipProps {
  status: string
}

export default function ClientStatusChip({ status }: ClientStatusChipProps) {
  return <ActiveStatusChip status={status} />
}
