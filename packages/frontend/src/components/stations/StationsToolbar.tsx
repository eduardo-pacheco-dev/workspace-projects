import { Box, Button, Typography } from '@mui/material'
import { Add, Upload } from '@mui/icons-material'

interface StationsToolbarProps {
  total: number
  onImport: () => void
  onNew: () => void
}

export default function StationsToolbar({ total, onImport, onNew }: StationsToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Estações (ERBS)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {total} estação(ões) cadastrada(s)
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" startIcon={<Upload />} onClick={onImport}>
          Importar
        </Button>
        <Button variant="contained" startIcon={<Add />} onClick={onNew}>
          Nova Estação
        </Button>
      </Box>
    </Box>
  )
}
