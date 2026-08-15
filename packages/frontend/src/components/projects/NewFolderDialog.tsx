import { useState, useEffect } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress } from '@mui/material'

interface NewFolderDialogProps {
  open: boolean
  creating: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

export default function NewFolderDialog({ open, creating, onClose, onCreate }: NewFolderDialogProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName('')
  }, [open])

  const submit = () => {
    if (!name.trim()) return
    onCreate(name.trim())
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nova Pasta</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          label="Nome da pasta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={creating || !name.trim()}>
          {creating ? <CircularProgress size={20} color="inherit" /> : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
