import { useState, useEffect } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { ExplorerItem } from '../../pages/projects/explorerTypes'

interface MoveDialogProps {
  target: ExplorerItem | null
  folders: ExplorerItem[]
  onClose: () => void
  onMove: (destination: number | 'root') => void
}

export default function MoveDialog({ target, folders, onClose, onMove }: MoveDialogProps) {
  const [destination, setDestination] = useState<number | 'root'>('root')

  useEffect(() => {
    if (target) setDestination(target.folderId ?? 'root')
  }, [target])

  return (
    <Dialog open={Boolean(target)} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Mover para</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Escolha a pasta de destino para "{target?.originalName}".
        </DialogContentText>
        <FormControl fullWidth>
          <InputLabel>Destino</InputLabel>
          <Select
            value={destination}
            onChange={(e) => setDestination(e.target.value as number | 'root')}
            label="Destino"
          >
            <MenuItem value="root">Raiz (Anexos)</MenuItem>
            {folders
              .filter((f) => f.id !== target?.id)
              .map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.originalName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => onMove(destination)}>
          Mover
        </Button>
      </DialogActions>
    </Dialog>
  )
}
