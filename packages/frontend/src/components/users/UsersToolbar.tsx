import { Box, Button } from '@mui/material'
import { FileDownload, PersonAdd } from '@mui/icons-material'
import PageToolbar from '../ui/PageToolbar'

interface UsersToolbarProps {
  onExport: () => void
  onNew: () => void
}

export default function UsersToolbar({ onExport, onNew }: UsersToolbarProps) {
  return (
    <PageToolbar
      title="Usuários"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={onExport}>
            Exportar Excel
          </Button>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={onNew}>
            Novo Usuário
          </Button>
        </Box>
      }
    />
  )
}
