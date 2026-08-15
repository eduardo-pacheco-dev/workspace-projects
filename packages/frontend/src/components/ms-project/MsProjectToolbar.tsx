import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

interface MsProjectToolbarProps {
  total: number
  onNew: () => void
}

export default function MsProjectToolbar({ total, onNew }: MsProjectToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Box>
        <Typography variant="h4">Cronograma (MS Project)</Typography>
        <Typography variant="body2" color="text.secondary">
          {total} plano(s) de projeto
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<Add />} onClick={onNew}>
        Novo Plano
      </Button>
    </Box>
  )
}
