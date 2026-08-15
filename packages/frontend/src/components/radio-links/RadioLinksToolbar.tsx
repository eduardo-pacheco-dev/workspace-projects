import { Box, Button, Typography } from '@mui/material'
import { Add, Upload } from '@mui/icons-material'

interface RadioLinksToolbarProps {
  onImport: () => void
  onNew: () => void
}

export default function RadioLinksToolbar({ onImport, onNew }: RadioLinksToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Enlaces de Rádio</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" startIcon={<Upload />} onClick={onImport}>
          Importar
        </Button>
        <Button variant="contained" startIcon={<Add />} onClick={onNew}>
          Novo Enlace
        </Button>
      </Box>
    </Box>
  )
}
