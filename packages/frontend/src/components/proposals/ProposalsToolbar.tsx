import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

interface ProposalsToolbarProps {
  onNew: () => void
}

export default function ProposalsToolbar({ onNew }: ProposalsToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Propostas</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={onNew}>
        Nova Proposta
      </Button>
    </Box>
  )
}
