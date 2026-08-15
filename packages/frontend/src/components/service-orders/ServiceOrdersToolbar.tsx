import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

interface ServiceOrdersToolbarProps {
  onNew: () => void
}

export default function ServiceOrdersToolbar({ onNew }: ServiceOrdersToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Ordens de Serviço</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={onNew}>
        Nova Ordem de Serviço
      </Button>
    </Box>
  )
}
