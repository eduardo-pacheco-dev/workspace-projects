import { Avatar, Box, Card, CardActions, CardContent, Divider, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete, Folder, Person, DateRange } from '@mui/icons-material'
import { Project, formatProjectDate, companyLabel, terminoLabel } from '../../pages/projects/projectsTypes'
import { getInitials } from '../../utils/format'
import Button from '../ui/Button'
import ProjectStatusChip from './ProjectStatusChip'

interface ProjectsCardsProps {
  projects: Project[]
  onOpen: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  value: string
}

function Field({ icon, label, value }: FieldProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
      <Box sx={{ color: 'rgb(0, 21, 68)', display: 'flex', fontSize: 18 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
            lineHeight: 1.2,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

export default function ProjectsCards({ projects, onOpen, onEdit, onDelete }: ProjectsCardsProps) {
  if (projects.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
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
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
            }}
            onClick={() => onOpen(project)}
          >
            <Box sx={{ bgcolor: 'rgb(0, 21, 68)', px: 2, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  width: 42,
                  height: 42,
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {getInitials(project.nome)}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                  {project.nome}
                </Typography>
                <Typography noWrap variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {project.codigo || 'Sem código'}
                </Typography>
              </Box>
              <ProjectStatusChip status={project.status} />
            </Box>

            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
              <Field icon={<Folder fontSize="inherit" />} label="Cliente" value={project.cliente || '-'} />
              <Divider sx={{ my: 0.5 }} />
              <Field icon={<Person fontSize="inherit" />} label="Empresa" value={companyLabel(project)} />
              <Divider sx={{ my: 0.5 }} />
              <Field icon={<Person fontSize="inherit" />} label="Responsável" value={project.responsavel || '-'} />
              <Divider sx={{ my: 0.5 }} />
              <Field
                icon={<DateRange fontSize="inherit" />}
                label="Período"
                value={`${formatProjectDate(project.dataInicio)} · ${terminoLabel(project.dataFim)}`}
              />
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1.5 }}>
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
