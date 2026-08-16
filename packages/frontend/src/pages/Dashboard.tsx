import { useState, useEffect } from 'react'
import { Alert, Chip, Container, Grid } from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import FolderIcon from '@mui/icons-material/Folder'
import CellTowerIcon from '@mui/icons-material/CellTower'
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonIcon from '@mui/icons-material/Person'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import DescriptionIcon from '@mui/icons-material/Description'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'
import api from '../services/api'
import { formatCurrency } from '../utils/format'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardNote from '../components/dashboard/DashboardNote'
import DashboardTasks from '../components/dashboard/DashboardTasks'
import DashboardAgenda from '../components/dashboard/DashboardAgenda'
import StatsGrid, { StatCardConfig } from '../components/dashboard/StatsGrid'
import ListPanel, { ListRow } from '../components/dashboard/ListPanel'
import FinancePanel from '../components/dashboard/FinancePanel'

interface RecentProject {
  id: number
  nome: string
  codigo: string | null
  status: string
}

interface TaskSummary {
  id: number
  title: string
  status: string
  priority: string
  dueAt?: string | null
}

interface Station {
  id: number
  siteId: string
  endId: string
  mobileCarrier: string | null
}

interface RadioLink {
  id: number
  nome: string
  frequencia: string | null
  siteIdA: string | null
  siteIdB: string | null
}

interface Project {
  id: number
  nome: string
  codigo: string | null
  cliente: string | null
  status: string
  descricao: string | null
}

const GREEN_GRADIENT = 'linear-gradient(135deg, #2e7d32, #66bb6a)'
const BLUE_GRADIENT = 'linear-gradient(135deg, #1565c0, #42a5f5)'
const PURPLE_GRADIENT = 'linear-gradient(135deg, #6a1b9a, #ab47bc)'
const ORANGE_GRADIENT = 'linear-gradient(135deg, #e65100, #ff9800)'
const TEAL_GRADIENT = 'linear-gradient(135deg, #00695c, #26a69a)'
const LIGHT_BLUE_GRADIENT = 'linear-gradient(135deg, #1976d2, #42a5f5)'

function totalOf(result: PromiseSettledResult<any>): number {
  if (result.status !== 'fulfilled') return 0
  return Array.isArray(result.value.data) ? result.value.data.length : (result.value.data.total ?? 0)
}

function extractList<T>(result: PromiseSettledResult<any>): T[] {
  if (result.status !== 'fulfilled') return []
  return Array.isArray(result.value.data) ? result.value.data : (result.value.data.data ?? [])
}

function projectRows(projects: RecentProject[]): ListRow[] {
  return projects.map((p) => ({
    key: p.id,
    icon: <FolderIcon fontSize="small" />,
    gradient: GREEN_GRADIENT,
    title: p.nome,
    caption: p.codigo || 'Sem código',
    chip: (
      <Chip
        size="small"
        label={p.status === 'ativo' ? 'Ativo' : 'Inativo'}
        color={p.status === 'ativo' ? 'success' : 'default'}
        variant="outlined"
      />
    ),
    path: `/projects/${p.id}`,
  }))
}

function stationRows(stations: Station[]): ListRow[] {
  return stations.map((s) => ({
    key: s.id,
    icon: <CellTowerIcon fontSize="small" />,
    gradient: PURPLE_GRADIENT,
    title: `${s.siteId} · ${s.endId}`,
    caption: s.mobileCarrier || 'Sem operadora',
    path: `/stations/${s.id}`,
  }))
}

function radioLinkRows(radioLinks: RadioLink[]): ListRow[] {
  return radioLinks.map((rl) => ({
    key: rl.id,
    icon: <SettingsInputAntennaIcon fontSize="small" />,
    gradient: ORANGE_GRADIENT,
    title: rl.nome,
    caption: `${rl.siteIdA || '-'} ↔ ${rl.siteIdB || '-'}${rl.frequencia ? ` · ${rl.frequencia}` : ''}`,
    path: `/radio-links/${rl.id}`,
  }))
}

const TASK_STATUS_MAP: Record<string, { label: string; color: 'info' | 'warning' | 'success' }> = {
  pending: { label: 'Pendente', color: 'info' },
  in_progress: { label: 'Em andamento', color: 'warning' },
  completed: { label: 'Concluída', color: 'success' },
}

function taskRows(tasks: TaskSummary[]): ListRow[] {
  return tasks.map((t) => {
    const info = TASK_STATUS_MAP[t.status] || { label: t.status, color: 'info' as const }
    return {
      key: t.id,
      icon: <CheckCircleIcon fontSize="small" />,
      gradient: LIGHT_BLUE_GRADIENT,
      title: t.title,
      caption: t.dueAt ? `Vence em ${new Date(t.dueAt).toLocaleDateString('pt-BR')}` : 'Sem prazo',
      chip: <Chip size="small" label={info.label} color={info.color} variant="outlined" />,
      path: `/tasks/${t.id}`,
    }
  })
}

function GlobalDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    projects: 0,
    stations: 0,
    radioLinks: 0,
    serviceOrders: 0,
    income: 0,
    expenses: 0,
    balance: 0,
  })
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])

  useEffect(() => {
    const today = new Date()
    Promise.allSettled([
      api.get('/clients', { params: { limit: 1 } }),
      api.get('/projects', { params: { limit: 1 } }),
      api.get('/stations', { params: { limit: 1 } }),
      api.get('/radio-links', { params: { limit: 1 } }),
      api.get('/service-orders', { params: { limit: 1 } }),
      api.get('/projects', { params: { limit: 4, sortBy: 'createdAt', sortOrder: 'DESC' } }),
      api.get('/finance/reports/summary', {
        params: { month: today.getMonth() + 1, year: today.getFullYear() },
      }),
    ]).then(([clients, projects, stations, radioLinks, serviceOrders, recent, summary]) => {
      setStats({
        clients: totalOf(clients),
        projects: totalOf(projects),
        stations: totalOf(stations),
        radioLinks: totalOf(radioLinks),
        serviceOrders: totalOf(serviceOrders),
        income: summary.status === 'fulfilled' ? (summary.value.data.income ?? 0) : 0,
        expenses: summary.status === 'fulfilled' ? (summary.value.data.expenses ?? 0) : 0,
        balance: summary.status === 'fulfilled' ? (summary.value.data.balance ?? 0) : 0,
      })
      setRecentProjects(extractList<RecentProject>(recent))
    })
  }, [])

  const statsCards: StatCardConfig[] = [
    { label: 'Clientes', value: String(stats.clients), icon: <BusinessIcon />, gradient: BLUE_GRADIENT, path: '/clients' },
    { label: 'Projetos', value: String(stats.projects), icon: <FolderIcon />, gradient: GREEN_GRADIENT, path: '/projects' },
    { label: 'Estações', value: String(stats.stations), icon: <CellTowerIcon />, gradient: PURPLE_GRADIENT, path: '/stations' },
    { label: 'Enlaces de Rádio', value: String(stats.radioLinks), icon: <SettingsInputAntennaIcon />, gradient: ORANGE_GRADIENT, path: '/radio-links' },
    { label: 'Ordens de Serviço', value: String(stats.serviceOrders), icon: <AssignmentIcon />, gradient: TEAL_GRADIENT, path: '/service-orders' },
    { label: 'Receitas do mês', value: formatCurrency(stats.income), icon: <TrendingUpIcon />, gradient: GREEN_GRADIENT, path: '/finance' },
    { label: 'Despesas do mês', value: formatCurrency(stats.expenses), icon: <TrendingDownIcon />, gradient: 'linear-gradient(135deg, #c62828, #ef5350)', path: '/finance' },
    { label: 'Saldo do mês', value: formatCurrency(stats.balance), icon: <AccountBalanceWalletIcon />, gradient: BLUE_GRADIENT, path: '/finance' },
  ]

  return (
    <>
      <StatsGrid cards={statsCards} columns={3} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <ListPanel
            title="Projetos Recentes"
            rows={projectRows(recentProjects)}
            emptyMessage="Nenhum projeto cadastrado."
            action={{ label: 'Ver todos', path: '/projects' }}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <FinancePanel income={stats.income} expenses={stats.expenses} balance={stats.balance} />
        </Grid>
      </Grid>
    </>
  )
}

function UserDashboard() {
  const [stats, setStats] = useState({
    tasks: 0,
    serviceOrders: 0,
    collaborators: 0,
    stations: 0,
    radioLinks: 0,
    projects: 0,
  })
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [recentTasks, setRecentTasks] = useState<TaskSummary[]>([])

  useEffect(() => {
    Promise.allSettled([
      api.get('/tasks', { params: { limit: 1 } }),
      api.get('/service-orders', { params: { limit: 1 } }),
      api.get('/collaborators', { params: { limit: 1 } }),
      api.get('/stations', { params: { limit: 1 } }),
      api.get('/radio-links', { params: { limit: 1 } }),
      api.get('/projects', { params: { limit: 1 } }),
      api.get('/projects', { params: { limit: 4, sortBy: 'createdAt', sortOrder: 'DESC' } }),
      api.get('/tasks', { params: { limit: 5, sortBy: 'dueAt', sortOrder: 'ASC' } }),
    ]).then(([tasks, serviceOrders, collaborators, stations, radioLinks, projects, recent, recentTasks]) => {
      setStats({
        tasks: totalOf(tasks),
        serviceOrders: totalOf(serviceOrders),
        collaborators: totalOf(collaborators),
        stations: totalOf(stations),
        radioLinks: totalOf(radioLinks),
        projects: totalOf(projects),
      })
      setRecentProjects(extractList<RecentProject>(recent))
      setRecentTasks(extractList<TaskSummary>(recentTasks))
    })
  }, [])

  const statCards: StatCardConfig[] = [
    { label: 'Tarefas', value: String(stats.tasks), icon: <CheckCircleIcon />, gradient: LIGHT_BLUE_GRADIENT, path: '/tasks' },
    { label: 'Ordens de Serviço', value: String(stats.serviceOrders), icon: <AssignmentIcon />, gradient: TEAL_GRADIENT, path: '/service-orders' },
    { label: 'Colaboradores', value: String(stats.collaborators), icon: <PersonIcon />, gradient: PURPLE_GRADIENT, path: '/collaborators' },
    { label: 'Estações', value: String(stats.stations), icon: <CellTowerIcon />, gradient: GREEN_GRADIENT, path: '/stations' },
    { label: 'Enlaces de Rádio', value: String(stats.radioLinks), icon: <SettingsInputAntennaIcon />, gradient: ORANGE_GRADIENT, path: '/radio-links' },
    { label: 'Projetos', value: String(stats.projects), icon: <FolderIcon />, gradient: BLUE_GRADIENT, path: '/projects' },
  ]

  return (
    <>
      <StatsGrid cards={statCards} columns={4} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <ListPanel
            title="Projetos Recentes"
            rows={projectRows(recentProjects)}
            emptyMessage="Nenhum projeto cadastrado."
            action={{ label: 'Ver todos', path: '/projects' }}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <ListPanel
            title="Próximas Tarefas"
            rows={taskRows(recentTasks)}
            emptyMessage="Nenhuma tarefa cadastrada."
            action={{ label: 'Ver todas', path: '/tasks' }}
          />
        </Grid>
      </Grid>
    </>
  )
}

function ProjectDashboard({ projectId }: { projectId: number }) {
  const [project, setProject] = useState<Project | null>(null)
  const [stations, setStations] = useState<Station[]>([])
  const [radioLinks, setRadioLinks] = useState<RadioLink[]>([])
  const [documentsCount, setDocumentsCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/stations`),
      api.get(`/projects/${projectId}/radio-links`),
      api.get(`/projects/${projectId}/documents`),
    ])
      .then(([projectRes, stationsRes, radioLinksRes, documentsRes]) => {
        setProject(projectRes.data)
        setStations(stationsRes.data ?? [])
        setRadioLinks(radioLinksRes.data ?? [])
        setDocumentsCount((documentsRes.data ?? []).length)
      })
      .catch((err: any) => setError(err.response?.data?.message || 'Não foi possível carregar o projeto.'))
  }, [projectId])

  const projectPath = `/projects/${projectId}`
  const statsCards: StatCardConfig[] = [
    { label: 'Estações', value: String(stations.length), icon: <CellTowerIcon />, gradient: PURPLE_GRADIENT, path: projectPath },
    { label: 'Enlaces de Rádio', value: String(radioLinks.length), icon: <SettingsInputAntennaIcon />, gradient: ORANGE_GRADIENT, path: projectPath },
    { label: 'Documentos', value: String(documentsCount), icon: <DescriptionIcon />, gradient: TEAL_GRADIENT, path: projectPath },
    { label: 'Status', value: project?.status === 'ativo' ? 'Ativo' : 'Inativo', icon: <AssignmentIcon />, gradient: BLUE_GRADIENT, path: projectPath },
  ]

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <StatsGrid cards={statsCards} columns={3} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ListPanel
            title="Estações do Projeto"
            rows={stationRows(stations)}
            emptyMessage="Nenhuma estação vinculada."
            action={{ label: 'Ver projeto', path: projectPath }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ListPanel
            title="Enlaces de Rádio do Projeto"
            rows={radioLinkRows(radioLinks)}
            emptyMessage="Nenhum enlace vinculado."
          />
        </Grid>
      </Grid>
    </>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { projectId } = useProject()
  const isMaster = user?.role === 'master'

  return (
    <>
      <DashboardHeader userName={user?.name ?? ''} isMaster={isMaster} />
      <Container maxWidth="lg" sx={{ mt: 3, mb: 6 }}>
        <Grid container spacing={3} sx={{ mb: 3, minHeight: '33.33vh' }}>
          <Grid item xs={12} md={6} lg={4}>
            <DashboardNote />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <DashboardTasks />
          </Grid>
          <Grid item xs={12} lg={4}>
            <DashboardAgenda />
          </Grid>
        </Grid>
        {projectId ? (
          <ProjectDashboard projectId={projectId} />
        ) : isMaster ? (
          <GlobalDashboard />
        ) : (
          <UserDashboard />
        )}
      </Container>
    </>
  )
}
