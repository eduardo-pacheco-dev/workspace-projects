import ActiveStatusChip from '../ui/ActiveStatusChip'

interface ProjectStatusChipProps {
  status: string
}

export default function ProjectStatusChip({ status }: ProjectStatusChipProps) {
  return <ActiveStatusChip status={status} />
}
