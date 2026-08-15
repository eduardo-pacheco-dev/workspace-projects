import { Chip } from '@mui/material'
import { jobStatusLabels, jobStatusColors } from '../../pages/jobs/jobsTypes'

interface JobStatusChipProps {
  status: string
}

export default function JobStatusChip({ status }: JobStatusChipProps) {
  return (
    <Chip
      size="small"
      label={jobStatusLabels[status] || status}
      color={jobStatusColors[status] || 'default'}
    />
  )
}
