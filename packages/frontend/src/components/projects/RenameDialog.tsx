import { useState, useEffect } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { ExplorerItem } from '../../pages/projects/explorerTypes'

interface RenameDialogProps {
  target: ExplorerItem | null
  onClose: () => void
  onRename: (name: string) => void
}

export default function RenameDialog({ target, onClose, onRename }: RenameDialogProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (target) setName(target.originalName)
  }, [target])

  const submit = () => {
    if (!name.trim()) return
    onRename(name.trim())
  }

  return (
    <Dialog open={Boolean(target)} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Renomear</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={!name.trim()}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
