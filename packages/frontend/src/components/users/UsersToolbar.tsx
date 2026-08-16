import { Box, Typography } from '@mui/material'
import { FileDownload, PersonAdd } from '@mui/icons-material'
import Button from '../ui/Button'

interface UsersToolbarProps {
  total: number
  onExport: () => void
  onNew: () => void
}

export default function UsersToolbar({ total, onExport, onNew }: UsersToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Usuários</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {total} usuário(s) cadastrado(s)
        </Typography>
      </Box>
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
