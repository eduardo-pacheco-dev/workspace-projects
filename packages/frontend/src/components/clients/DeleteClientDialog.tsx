import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface DeleteClientDialogProps {
  client: { id: number; nome: string } | null
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteClientDialog({ client, onClose, onConfirm }: DeleteClientDialogProps) {
  const open = Boolean(client)
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Excluir cliente</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir o cliente <strong>{client?.nome}</strong>?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  )
}
