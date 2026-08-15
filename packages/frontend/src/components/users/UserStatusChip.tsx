import ActiveStatusChip from '../ui/ActiveStatusChip'

interface UserStatusChipProps {
  status: string
}

export default function UserStatusChip({ status }: UserStatusChipProps) {
  return <ActiveStatusChip status={status} />
}
