import DeleteConfirmDialog from '../ui/DeleteConfirmDialog'

interface DeleteClientDialogProps {
  client: { id: number; nome: string } | null
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteClientDialog({ client, onClose, onConfirm }: DeleteClientDialogProps) {
  return (
    <DeleteConfirmDialog
      open={Boolean(client)}
      title="Excluir cliente"
      message={<>Tem certeza que deseja excluir o cliente <strong>{client?.nome}</strong>?</>}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
