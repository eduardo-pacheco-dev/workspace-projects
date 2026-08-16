import { Box, Typography } from '@mui/material'
import { Add, Upload } from '@mui/icons-material'
import Button from '../ui/Button'

interface RadioLinksToolbarProps {
  total: number
  onImport: () => void
  onNew: () => void
}

export default function RadioLinksToolbar({ total, onImport, onNew }: RadioLinksToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Enlaces de Rádio</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {total} enlace(s) cadastrado(s)
        </Typography>
      </Box>
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
