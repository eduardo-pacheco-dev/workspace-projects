import DeleteConfirmDialog from '../ui/DeleteConfirmDialog'

interface DeleteLpuDialogProps {
  lpu: { id: number; nome: string } | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteLpuDialog({ lpu, deleting, onClose, onConfirm }: DeleteLpuDialogProps) {
  return (
    <DeleteConfirmDialog
      open={Boolean(lpu)}
      title="Excluir LPU"
      message={
        <>Tem certeza que deseja excluir a LPU <strong>{lpu?.nome}</strong>? Esta ação não pode ser desfeita.</>
      }
      deleting={deleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
