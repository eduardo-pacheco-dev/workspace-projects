import DeleteConfirmDialog from '../ui/DeleteConfirmDialog'

interface DeleteCollaboratorDialogProps {
  target: { id: number; nome: string } | null
  entityLabel: string
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteCollaboratorDialog({ target, entityLabel, deleting, onClose, onConfirm }: DeleteCollaboratorDialogProps) {
  const entityLower = entityLabel.toLowerCase()
  return (
    <DeleteConfirmDialog
      open={Boolean(target)}
      title={`Excluir ${entityLabel}`}
      message={
        <>Tem certeza que deseja excluir o {entityLower} <strong>{target?.nome}</strong>? Esta ação não pode ser desfeita.</>
      }
      deleting={deleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
