import DeleteConfirmDialog from '../ui/DeleteConfirmDialog'
import { ExplorerItem } from '../../pages/projects/explorerTypes'

interface DeleteExplorerDialogProps {
  target: ExplorerItem | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteExplorerDialog({ target, deleting, onClose, onConfirm }: DeleteExplorerDialogProps) {
  const kind = target?.isFolder ? 'pasta' : 'arquivo'
  return (
    <DeleteConfirmDialog
      open={Boolean(target)}
      title={`Excluir ${kind}`}
      message={
        <>
          Tem certeza que deseja excluir "{target?.originalName}"?
          {target?.isFolder ? ' Todos os itens dentro dela também serão excluídos.' : ''}
        </>
      }
      deleting={deleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
