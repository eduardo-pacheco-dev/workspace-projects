import { Box, Button, Typography } from '@mui/material'
import { Add, FileDownload } from '@mui/icons-material'

interface ClientsToolbarProps {
  onExport: () => void
  onNew: () => void
}

export default function ClientsToolbar({ onExport, onNew }: ClientsToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Clientes</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={onExport}>
          Exportar Excel
        </Button>
        <Button variant="contained" startIcon={<Add />} onClick={onNew}>
          Novo Cliente
        </Button>
      </Box>
    </Box>
  )
}
