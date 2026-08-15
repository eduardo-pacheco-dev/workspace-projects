import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

interface PdcaToolbarProps {
  embedded?: boolean
  onNew: () => void
}

export default function PdcaToolbar({ embedded, onNew }: PdcaToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Box>
        <Typography variant={embedded ? 'h6' : 'h4'}>{embedded ? 'Ciclos PDCA' : 'PDCA'}</Typography>
        <Typography variant="body2" color="text.secondary">
          Gestão de melhoria contínua: Plan, Do, Check, Act
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<Add />} onClick={onNew}>
        Novo Ciclo
      </Button>
    </Box>
  )
}
