import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material'
import { ExplorerItem } from '../../pages/projects/explorerTypes'

interface DeleteExplorerDialogProps {
  target: ExplorerItem | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteExplorerDialog({ target, deleting, onClose, onConfirm }: DeleteExplorerDialogProps) {
  return (
    <Dialog open={Boolean(target)} onClose={onClose}>
      <DialogTitle>Excluir {target?.isFolder ? 'pasta' : 'arquivo'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir "{target?.originalName}"?
          {target?.isFolder ? ' Todos os itens dentro dela também serão excluídos.' : ''}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={deleting}>
          {deleting ? <CircularProgress size={20} color="inherit" /> : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
