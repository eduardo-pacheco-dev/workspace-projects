import { Box, Button, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

interface ProjectsToolbarProps {
  onNew: () => void
}

export default function ProjectsToolbar({ onNew }: ProjectsToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Projetos</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={onNew}>
        Novo Projeto
      </Button>
    </Box>
  )
}
