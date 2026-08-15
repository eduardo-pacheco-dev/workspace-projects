import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Container, Divider, Grid, Typography } from '@mui/material'
import { useParams, Link } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import { Button, CircularProgress } from '@mui/material'
import api from '../../services/api'
import PlanHeader from '../../components/ms-project/PlanHeader'
import PlanSummaryCards from '../../components/ms-project/PlanSummaryCards'
import GanttPanel from '../../components/ms-project/GanttPanel'
import TasksSection from '../../components/ms-project/TasksSection'
import DependenciesSection from '../../components/ms-project/DependenciesSection'
import ResourcesSection from '../../components/ms-project/ResourcesSection'
import AssignmentsSection from '../../components/ms-project/AssignmentsSection'
import PlanModal from './PlanModal'
import TaskModal from './TaskModal'
import ResourceModal from './ResourceModal'
import { MsProjectDetail as Detail, MsTask, MsResource } from './msProjectTypes'

export default function MsProjectDetailPage() {
  const { id } = useParams()

  const [plan, setPlan] = useState<Detail | null>(null)
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

  const openTask = (editId: number | null) => setTaskModal({ open: true, editId })
  const openResource = (editId: number | null) => setResourceModal({ open: true, editId })

  return (
    <Container sx={{ mt: 4 }}>
      <PlanHeader
        plan={plan}
        recomputing={recomputing}
        onRecompute={handleRecompute}
        onEdit={() => setPlanModal({ open: true, editId: plan.id })}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PlanSummaryCards plan={plan} />

      <GanttPanel plan={plan} onNewTask={() => openTask(null)} onNewResource={() => openResource(null)} />

      <TasksSection plan={plan} onReload={fetchPlan} onEdit={(task: MsTask) => openTask(task.id)} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <DependenciesSection plan={plan} onReload={fetchPlan} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ResourcesSection
            plan={plan}
            onReload={fetchPlan}
            onEdit={(resource: MsResource) => openResource(resource.id)}
            onNew={() => openResource(null)}
          />
        </Grid>
      </Grid>

      <AssignmentsSection plan={plan} onReload={fetchPlan} />

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        Caminho crítico: {plan.schedule.criticalTasks.length} tarefa(s) crítica(s)
      </Typography>

      <PlanModal
        open={planModal.open}
        editId={planModal.editId}
        onClose={() => setPlanModal({ open: false, editId: null })}
        onSaved={fetchPlan}
      />
      <TaskModal
        projectId={plan.id}
        open={taskModal.open}
        editId={taskModal.editId}
        tasks={plan.tasks}
        onClose={() => setTaskModal({ open: false, editId: null })}
        onSaved={fetchPlan}
      />
      <ResourceModal
        projectId={plan.id}
        open={resourceModal.open}
        editId={resourceModal.editId}
        tasks={plan.tasks}
        onClose={() => setResourceModal({ open: false, editId: null })}
        onSaved={fetchPlan}
      />
    </Container>
  )
}
