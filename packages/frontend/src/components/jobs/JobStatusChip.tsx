import StatusChip from '../ui/StatusChip'
import { jobStatusLabels, jobStatusColors } from '../../pages/jobs/jobsTypes'

interface JobStatusChipProps {
  status: string
}

export default function JobStatusChip({ status }: JobStatusChipProps) {
  return <StatusChip value={status} labels={jobStatusLabels} colors={jobStatusColors} />
}
