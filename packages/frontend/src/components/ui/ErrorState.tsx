import { Alert, AlertColor } from '@mui/material'

interface ErrorStateProps {
  message: string
  severity?: AlertColor
}

export default function ErrorState({ message, severity = 'error' }: ErrorStateProps) {
  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {message}
    </Alert>
  )
}
