import { Box, Button, Typography } from '@mui/material'
import { FileDownload, PersonAdd } from '@mui/icons-material'

interface UsersToolbarProps {
  onExport: () => void
  onNew: () => void
}

export default function UsersToolbar({ onExport, onNew }: UsersToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Usuários</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" startIcon={<FileDownload />} onClick={onExport}>
          Exportar Excel
        </Button>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={onNew}>
          Novo Usuário
        </Button>
      </Box>
    </Box>
  )
}
