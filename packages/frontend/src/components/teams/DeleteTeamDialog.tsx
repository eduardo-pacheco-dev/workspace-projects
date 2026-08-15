import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

interface DeleteTeamDialogProps {
  team: { id: number; nome: string } | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteTeamDialog({ team, deleting, onClose, onConfirm }: DeleteTeamDialogProps) {
  const open = Boolean(team)
  return (
    <Dialog open={open} onClose={() => { if (!deleting) onClose() }}>
      <DialogTitle>Excluir Equipe</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir a equipe <strong>{team?.nome}</strong>? Esta ação não pode ser desfeita.
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
