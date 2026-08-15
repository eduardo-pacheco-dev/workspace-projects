import { Box, Button, Typography } from '@mui/material'
import { GroupAdd } from '@mui/icons-material'

interface TeamsToolbarProps {
  onNew: () => void
}

export default function TeamsToolbar({ onNew }: TeamsToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Equipes</Typography>
      <Button variant="contained" startIcon={<GroupAdd />} onClick={onNew}>
        Nova Equipe
      </Button>
    </Box>
  )
}
