import { CircularProgress } from '@mui/material'
import Button from './Button'

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean
  loadingText?: string
}

export default function SubmitButton({ loading = false, loadingText, children, disabled, ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" {...props} disabled={disabled || loading}>
      {loading ? (
        loadingText ? (
          loadingText
        ) : (
          <CircularProgress size={24} color="inherit" />
        )
      ) : (
        children
      )}
    </Button>
  )
}
