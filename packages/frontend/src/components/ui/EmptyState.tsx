import { Paper, Typography } from '@mui/material'

interface EmptyStateProps {
  message: string
  py?: number
}

export default function EmptyState({ message, py = 4 }: EmptyStateProps) {
  return (
    <Paper sx={{ p: py, textAlign: 'center' }}>
      <Typography color="text.secondary">{message}</Typography>
    </Paper>
  )
}
