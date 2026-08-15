import { Alert, Snackbar } from '@mui/material'
import { useToastStore } from '../stores/toastStore'

export default function Toaster() {
  const toast = useToastStore((s) => s.toast)
  const hideToast = useToastStore((s) => s.hideToast)

  const handleClose = (_?: unknown, reason?: string) => {
    if (reason === 'clickaway') return
    hideToast()
  }

  return (
    <Snackbar
      key={toast?.id ?? undefined}
      open={Boolean(toast)}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={toast?.severity} variant="filled" sx={{ width: '100%' }}>
        {toast?.message}
      </Alert>
    </Snackbar>
  )
}
