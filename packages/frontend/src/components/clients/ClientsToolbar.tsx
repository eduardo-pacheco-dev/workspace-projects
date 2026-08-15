import { Box, Button } from '@mui/material'
import { Add, FileDownload } from '@mui/icons-material'
import PageToolbar from '../ui/PageToolbar'

interface ClientsToolbarProps {
  onExport: () => void
  onNew: () => void
}

export default function ClientsToolbar({ onExport, onNew }: ClientsToolbarProps) {
  return (
    <PageToolbar
      title="Clientes"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={onExport}>
            Exportar Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={onNew}>
            Novo Cliente
          </Button>
        </Box>
      }
    />
  )
}
