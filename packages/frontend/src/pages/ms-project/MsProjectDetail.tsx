import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  Box,
  Chip,
  IconButton,
  Stack,
  Divider,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material'
import { Edit, Delete, Add, Replay, ArrowBack } from '@mui/icons-material'
import api from '../../services/api'
import GanttChart from './GanttChart'
import PlanModal from './PlanModal'
import TaskModal from './TaskModal'
import ResourceModal from './ResourceModal'
import {
  MsProjectDetail,
  MsTask,
  MsDependency,
  MsResource,
  MsAssignment,
  msProjectStatusLabels,
  msProjectStatusColors,
  dependencyTypeLabels,
  resourceTypeLabels,
  taskPriorityLabels,
  taskPriorityColors,
  weekdayLabels,
  formatDate,
} from './msProjectTypes'

export default function MsProjectDetailPage() {
  const { id } = useParams()

  const [plan, setPlan] = useState<MsProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [planModal, setPlanModal] = useState({ open: false, editId: null as number | null })
  const [taskModal, setTaskModal] = useState({ open: false, editId: null as number | null })
  const [resourceModal, setResourceModal] = useState({ open: false, editId: null as number | null })
  const [recomputing, setRecomputing] = useState(false)

  const fetchPlan = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/ms-project/${id}`)
      setPlan(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o plano.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  const handleRecompute = async () => {
    setRecomputing(true)
    setError('')
    try {
      await api.post(`/ms-project/${id}/schedule`)
      await fetchPlan()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível recalcular o cronograma.')
    } finally {
      setRecomputing(false)
    }
  }

  const handleDeleteTask = async (task: MsTask) => {
    if (!confirm(`Excluir a tarefa "${task.name}"?`)) return
    try {
      await api.delete(`/ms-project/tasks/${task.id}`)
      fetchPlan()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir a tarefa.')
    }
  }

  const handleDeleteDependency = async (dep: MsDependency) => {
    if (!confirm('Excluir esta dependência?')) return
    try {
      await api.delete(`/ms-project/dependencies/${dep.id}`)
      fetchPlan()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir a dependência.')
    }
  }

  const handleDeleteResource = async (resource: MsResource) => {
    if (!confirm(`Excluir o recurso "${resource.name}"?`)) return
    try {
      await api.delete(`/ms-project/resources/${resource.id}`)
      fetchPlan()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir o recurso.')
    }
  }

  const handleDeleteAssignment = async (assignment: MsAssignment) => {
    if (!confirm('Excluir esta atribuição?')) return
    try {
      await api.delete(`/ms-project/assignments/${assignment.id}`)
      fetchPlan()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir a atribuição.')
    }
  }

  if (loading && !plan) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!plan) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Plano não encontrado.'}</Alert>
        <Button component={Link} to="/ms-project" startIcon={<ArrowBack />} sx={{ mt: 2 }}>
          Voltar para planos
        </Button>
      </Container>
    )
  }

  const taskName = (taskId: number) => plan.tasks.find((t) => t.id === taskId)?.name || `#${taskId}`
  const resourceName = (resourceId: number) => plan.resources.find((r) => r.id === resourceId)?.name || `#${resourceId}`
  const taskAssignments = (taskId: number) =>
    plan.assignments
      .filter((a) => a.taskId === taskId)
      .map((a) => `${resourceName(a.resourceId)} (${a.units}%)`)
      .join(', ') || '-'

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button component={Link} to="/ms-project" startIcon={<ArrowBack />} size="small" sx={{ mb: 1 }}>
          Voltar para planos
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h4">{plan.name}</Typography>
              <Chip
                size="small"
                label={msProjectStatusLabels[plan.status] || plan.status}
                color={msProjectStatusColors[plan.status] || 'default'}
              />
            </Stack>
            {plan.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {plan.description}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Replay />}
              onClick={handleRecompute}
              disabled={recomputing}
            >
              Recalcular
            </Button>
            <Button variant="outlined" startIcon={<Edit />} onClick={() => setPlanModal({ open: true, editId: plan.id })}>
              Editar
            </Button>
          </Stack>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Início</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatDate(plan.startDate)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Término</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatDate(plan.endDate)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Duração</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{plan.durationDays ?? '-'} dias úteis</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">Dias úteis</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {plan.workingDays.map((d) => weekdayLabels[d]?.slice(0, 3)).join(', ')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6">Gráfico de Gantt</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" startIcon={<Add />} onClick={() => setTaskModal({ open: true, editId: null })}>
              Nova Tarefa
            </Button>
            <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setResourceModal({ open: true, editId: null })}>
              Novo Recurso
            </Button>
          </Stack>
        </Box>
        <GanttChart tasks={plan.tasks} dependencies={plan.dependencies} />
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Tarefas</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Duração</TableCell>
                <TableCell>% Concl.</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Término</TableCell>
                <TableCell>Folga</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Recursos</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plan.tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell>{task.position}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: task.critical ? 700 : 400 }}>
                        {task.milestone ? `◆ ${task.name}` : task.name}
                      </Typography>
                      {task.critical && <Chip size="small" color="error" label="crítica" />}
                    </Stack>
                  </TableCell>
                  <TableCell>{task.milestone ? 'Marco' : `${task.durationDays} d`}</TableCell>
                  <TableCell>{task.percentComplete}%</TableCell>
                  <TableCell>{formatDate(task.startDate)}</TableCell>
                  <TableCell>{formatDate(task.finishDate)}</TableCell>
                  <TableCell>{task.slackDays ?? '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={taskPriorityLabels[task.priority] || task.priority}
                      color={taskPriorityColors[task.priority] || 'default'}
                    />
                  </TableCell>
                  <TableCell>{taskAssignments(task.id)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" onClick={() => setTaskModal({ open: true, editId: task.id })}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteTask(task)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {plan.tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Nenhuma tarefa cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Dependências</Typography>
            {plan.dependencies.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Nenhuma dependência cadastrada.</Typography>
            ) : (
              <Table size="small">
                <TableBody>
                  {plan.dependencies.map((dep) => (
                    <TableRow key={dep.id} hover>
                      <TableCell>
                        {taskName(dep.predecessorTaskId)} <Chip size="small" label={dep.type} sx={{ mx: 0.5 }} />{' '}
                        {taskName(dep.taskId)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {dependencyTypeLabels[dep.type] || dep.type}{dep.lagDays ? ` · lag ${dep.lagDays}d` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDeleteDependency(dep)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recursos</Typography>
              <Button size="small" variant="outlined" startIcon={<Add />} onClick={() => setResourceModal({ open: true, editId: null })}>
                Novo Recurso
              </Button>
            </Box>
            {plan.resources.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Nenhum recurso cadastrado.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Unid. máx.</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.resources.map((resource) => (
                    <TableRow key={resource.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{resource.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{resource.email || ''}</Typography>
                      </TableCell>
                      <TableCell>{resourceTypeLabels[resource.type] || resource.type}</TableCell>
                      <TableCell>{resource.maxUnits}%</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" onClick={() => setResourceModal({ open: true, editId: resource.id })}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteResource(resource)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Atribuições</Typography>
        {plan.assignments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nenhuma atribuição cadastrada.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tarefa</TableCell>
                <TableCell>Recurso</TableCell>
                <TableCell>Unidades</TableCell>
                <TableCell>Trabalho (h)</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plan.assignments.map((assignment) => (
                <TableRow key={assignment.id} hover>
                  <TableCell>{taskName(assignment.taskId)}</TableCell>
                  <TableCell>{resourceName(assignment.resourceId)}</TableCell>
                  <TableCell>{assignment.units}%</TableCell>
                  <TableCell>{assignment.work ?? '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleDeleteAssignment(assignment)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        Caminho crítico: {plan.schedule.criticalTasks.length} tarefa(s) crítica(s)
      </Typography>

      <PlanModal
        open={planModal.open}
        editId={planModal.editId}
        onClose={() => setPlanModal({ open: false, editId: null })}
        onSaved={() => fetchPlan()}
      />
      <TaskModal
        projectId={plan.id}
        open={taskModal.open}
        editId={taskModal.editId}
        tasks={plan.tasks}
        onClose={() => setTaskModal({ open: false, editId: null })}
        onSaved={() => fetchPlan()}
      />
      <ResourceModal
        projectId={plan.id}
        open={resourceModal.open}
        editId={resourceModal.editId}
        tasks={plan.tasks}
        onClose={() => setResourceModal({ open: false, editId: null })}
        onSaved={() => fetchPlan()}
      />
    </Container>
  )
}
