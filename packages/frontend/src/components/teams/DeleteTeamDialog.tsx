import DeleteConfirmDialog from '../ui/DeleteConfirmDialog'

interface DeleteTeamDialogProps {
  team: { id: number; nome: string } | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteTeamDialog({ team, deleting, onClose, onConfirm }: DeleteTeamDialogProps) {
  return (
    <DeleteConfirmDialog
      open={Boolean(team)}
      title="Excluir Equipe"
      message={
        <>Tem certeza que deseja excluir a equipe <strong>{team?.nome}</strong>? Esta ação não pode ser desfeita.</>
      }
      deleting={deleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
