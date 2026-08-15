import ActiveStatusChip from '../ui/ActiveStatusChip'

interface CollaboratorStatusChipProps {
  status: string
}

export default function CollaboratorStatusChip({ status }: CollaboratorStatusChipProps) {
  return <ActiveStatusChip status={status} />
}
