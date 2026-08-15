import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { Project } from '../../pages/projects/projectsTypes'
import ProjectStatusChip from './ProjectStatusChip'

interface ProjectHeaderCardProps {
  project: Project
  onEdit: () => void
  onDelete: () => void
}

export default function ProjectHeaderCard({ project, onEdit, onDelete }: ProjectHeaderCardProps) {
  return (
    <Card sx={{ mb: 3, bgcolor: 'rgba(46, 125, 50, 0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon color="success" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4">{project.nome}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {project.codigo || 'Sem código'} {project.cliente ? ` · ${project.cliente}` : ''}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit} sx={{ mr: 1 }}>
              Editar
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
              Excluir
            </Button>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <ProjectStatusChip status={project.status} />
        </Box>
      </CardContent>
    </Card>
  )
}
