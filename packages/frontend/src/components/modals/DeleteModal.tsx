import { Box, Button, Dialog, DialogActions, Typography } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'

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
      <Box sx={{ p: 3, pb: 1, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            color: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <DeleteForeverIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={deleting}>
          Cancelar
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={deleting}>
          {deleting ? deletingLabel : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
