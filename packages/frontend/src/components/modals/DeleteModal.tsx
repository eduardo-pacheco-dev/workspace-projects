import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import Button from '../ui/Button'

interface DeleteModalProps {
  open: boolean
  title?: string
  message: React.ReactNode
  deleting?: boolean
  confirmLabel?: string
  deletingLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function DeleteModal({
  open,
  title = 'Excluir registro',
  message,
  deleting = false,
  confirmLabel = 'Excluir',
  deletingLabel = 'Excluindo...',
  onConfirm,
  onClose,
}: DeleteModalProps) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!deleting) onClose()
      }}
      maxWidth="xs"
      fullWidth
    >
      <Box sx={{ px: 3, pt: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            bgcolor: 'rgba(211, 47, 47, 0.12)',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <DeleteForeverIcon />
        </Box>
        <DialogTitle sx={{ p: 0, fontWeight: 700 }}>{title}</DialogTitle>
      </Box>
      <DialogContent sx={{ pt: 2 }}>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={deleting}>
          Cancelar
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={deleting}>
          {deleting ? (
            <>
              <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
              {deletingLabel}
            </>
          ) : (
            confirmLabel
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
