import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

interface ContractsToolbarProps {
  onNew: () => void
}

export default function ContractsToolbar({ onNew }: ContractsToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Contratos</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={onNew}>
        Novo Contrato
      </Button>
    </Box>
  )
}
