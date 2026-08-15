import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface DeleteUserDialogProps {
  user: { id: number; name: string } | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteUserDialog({ user, deleting, onClose, onConfirm }: DeleteUserDialogProps) {
  const open = Boolean(user)
  return (
    <Dialog open={open} onClose={() => { if (!deleting) onClose() }}>
      <DialogTitle>Excluir Usuário</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir o usuário <strong>{user?.name}</strong>? Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={deleting}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={deleting}>
          {deleting ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
