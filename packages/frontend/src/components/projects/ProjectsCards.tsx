import { Avatar, Box, Button, Card, CardActions, CardContent, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { Project, formatProjectDate, companyLabel, terminoLabel } from '../../pages/projects/projectsTypes'
import { getInitials } from '../../utils/format'
import ProjectStatusChip from './ProjectStatusChip'

interface ProjectsCardsProps {
  projects: Project[]
  onOpen: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export default function ProjectsCards({ projects, onOpen, onEdit, onDelete }: ProjectsCardsProps) {
  if (projects.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Nenhum projeto encontrado.</Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      {projects.map((project) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={project.id}>
          <Card
            variant="outlined"
            sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            onClick={() => onOpen(project)}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                  {getInitials(project.nome)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                    {project.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {project.codigo || 'Sem código'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <ProjectStatusChip status={project.status} />
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                Cliente: {project.cliente || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Empresa: {companyLabel(project)}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Responsável: {project.responsavel || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Início: {formatProjectDate(project.dataInicio)} · Término: {terminoLabel(project.dataFim)}
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(project)
                }}
              >
                Editar
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(project)
                }}
              >
                Excluir
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
