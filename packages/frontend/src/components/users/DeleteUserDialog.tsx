import DeleteModal from '../modals/DeleteModal'

interface DeleteUserDialogProps {
  user: { id: number; name: string } | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteUserDialog({ user, deleting, onClose, onConfirm }: DeleteUserDialogProps) {
  return (
    <DeleteModal
      open={Boolean(user)}
      title="Excluir Usuário"
      message={
        <>Tem certeza que deseja excluir o usuário <strong>{user?.name}</strong>? Esta ação não pode ser desfeita.</>
      }
      deleting={deleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
