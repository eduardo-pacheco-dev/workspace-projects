import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

interface CompaniesToolbarProps {
  total: number
  activeCount: number
  onNew: () => void
}

export default function CompaniesToolbar({ total, activeCount, onNew }: CompaniesToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Box>
        <Typography variant="h4">Empresas</Typography>
        <Typography variant="body2" color="text.secondary">
          {total} empresa(s) · {activeCount} ativas
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<Add />} onClick={onNew}>
        Nova Empresa
      </Button>
    </Box>
  )
}
