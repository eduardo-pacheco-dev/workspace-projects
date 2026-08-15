import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface DeleteCollaboratorDialogProps {
  target: { id: number; nome: string } | null
  entityLabel: string
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteCollaboratorDialog({ target, entityLabel, deleting, onClose, onConfirm }: DeleteCollaboratorDialogProps) {
  const open = Boolean(target)
  const entityLower = entityLabel.toLowerCase()
  return (
    <Dialog open={open} onClose={() => { if (!deleting) onClose() }}>
      <DialogTitle>Excluir {entityLabel}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir o {entityLower} <strong>{target?.nome}</strong>? Esta ação não pode ser desfeita.
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
