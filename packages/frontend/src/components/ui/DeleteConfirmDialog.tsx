import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface DeleteConfirmDialogProps {
  open: boolean
  title: string
  message: React.ReactNode
  deleting?: boolean
  confirmLabel?: string
  deletingLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function DeleteConfirmDialog({
  open,
  title,
  message,
  deleting = false,
  confirmLabel = 'Excluir',
  deletingLabel = 'Excluindo...',
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={() => { if (!deleting) onClose() }}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleting}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={deleting}>
          {deleting ? deletingLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
