import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Alert,
  Paper,
  Chip,
  Button,
  Stack,
  Divider,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'
import api from '../services/api'
import { formatCurrency } from '../utils/format'

interface StatCard {
  label: string
  value: string
  icon: React.ReactNode
  gradient: string
  path: string
}

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
  operadora: string | null
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

function GlobalDashboard() {
  const navigate = useNavigate()
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
      const totalOf = (r: PromiseSettledResult<any>) =>
        r.status === 'fulfilled'
          ? Array.isArray(r.value.data) ? r.value.data.length : (r.value.data.total ?? 0)
          : 0
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
      const data = recent.status === 'fulfilled'
        ? (Array.isArray(recent.value.data) ? recent.value.data : (recent.value.data.data ?? []))
        : []
      setRecentProjects(data)
    })
  }, [])

  const statsCards: StatCard[] = [
    { label: 'Clientes', value: String(stats.clients), icon: <BusinessIcon />, gradient: 'linear-gradient(135deg, #1976d2, #42a5f5)', path: '/clients' },
    { label: 'Projetos', value: String(stats.projects), icon: <FolderIcon />, gradient: 'linear-gradient(135deg, #2e7d32, #66bb6a)', path: '/projects' },
    { label: 'Estações', value: String(stats.stations), icon: <CellTowerIcon />, gradient: 'linear-gradient(135deg, #6a1b9a, #ab47bc)', path: '/stations' },
    { label: 'Enlaces de Rádio', value: String(stats.radioLinks), icon: <SettingsInputAntennaIcon />, gradient: 'linear-gradient(135deg, #e65100, #ff9800)', path: '/radio-links' },
    { label: 'Ordens de Serviço', value: String(stats.serviceOrders), icon: <AssignmentIcon />, gradient: 'linear-gradient(135deg, #00695c, #26a69a)', path: '/service-orders' },
    { label: 'Receitas do mês', value: formatCurrency(stats.income), icon: <TrendingUpIcon />, gradient: 'linear-gradient(135deg, #2e7d32, #66bb6a)', path: '/finance' },
    { label: 'Despesas do mês', value: formatCurrency(stats.expenses), icon: <TrendingDownIcon />, gradient: 'linear-gradient(135deg, #c62828, #ef5350)', path: '/finance' },
    { label: 'Saldo do mês', value: formatCurrency(stats.balance), icon: <AccountBalanceWalletIcon />, gradient: 'linear-gradient(135deg, #1565c0, #42a5f5)', path: '/finance' },
  ]

  const financeCards = [
    { label: 'Receitas', value: formatCurrency(stats.income), color: '#2e7d32' },
    { label: 'Despesas', value: formatCurrency(stats.expenses), color: '#c62828' },
    { label: 'Saldo', value: formatCurrency(stats.balance), color: '#1565c0' },
  ]

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsCards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 44, height: 44, background: item.gradient, boxShadow: 2 }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Projetos Recentes</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/projects')}>
                Ver todos
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recentProjects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                Nenhum projeto cadastrado.
              </Typography>
            ) : (
              recentProjects.map((p, index) => (
                <Box key={p.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                    }}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2e7d32, #66bb6a)' }}>
                      <FolderIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{p.codigo || 'Sem código'}</Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      color={p.status === 'ativo' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                  {index < recentProjects.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Finanças do Mês</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {financeCards.map((card) => (
                <Box key={card.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h6" sx={{ color: card.color, fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 0.5, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <Box sx={{ width: '100%', height: '100%', borderRadius: 3, background: card.color, opacity: 0.7 }} />
                  </Box>
                </Box>
              ))}
            </Stack>
            <Button fullWidth sx={{ mt: 3 }} endIcon={<ArrowForwardIcon />} onClick={() => navigate('/finance')}>
              Abrir Finanças
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

function UserDashboard() {
  const navigate = useNavigate()
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
      const totalOf = (r: PromiseSettledResult<any>) =>
        r.status === 'fulfilled'
          ? Array.isArray(r.value.data) ? r.value.data.length : (r.value.data.total ?? 0)
          : 0
      setStats({
        tasks: totalOf(tasks),
        serviceOrders: totalOf(serviceOrders),
        collaborators: totalOf(collaborators),
        stations: totalOf(stations),
        radioLinks: totalOf(radioLinks),
        projects: totalOf(projects),
      })
      const data = recent.status === 'fulfilled'
        ? (Array.isArray(recent.value.data) ? recent.value.data : (recent.value.data.data ?? []))
        : []
      setRecentProjects(data)
      const taskData = recentTasks.status === 'fulfilled'
        ? (Array.isArray(recentTasks.value.data) ? recentTasks.value.data : (recentTasks.value.data.data ?? []))
        : []
      setRecentTasks(taskData)
    })
  }, [])

  const statCards: StatCard[] = [
    { label: 'Tarefas', value: String(stats.tasks), icon: <CheckCircleIcon />, gradient: 'linear-gradient(135deg, #1976d2, #42a5f5)', path: '/tasks' },
    { label: 'Ordens de Serviço', value: String(stats.serviceOrders), icon: <AssignmentIcon />, gradient: 'linear-gradient(135deg, #00695c, #26a69a)', path: '/service-orders' },
    { label: 'Colaboradores', value: String(stats.collaborators), icon: <PersonIcon />, gradient: 'linear-gradient(135deg, #6a1b9a, #ab47bc)', path: '/collaborators' },
    { label: 'Estações', value: String(stats.stations), icon: <CellTowerIcon />, gradient: 'linear-gradient(135deg, #2e7d32, #66bb6a)', path: '/stations' },
    { label: 'Enlaces de Rádio', value: String(stats.radioLinks), icon: <SettingsInputAntennaIcon />, gradient: 'linear-gradient(135deg, #e65100, #ff9800)', path: '/radio-links' },
    { label: 'Projetos', value: String(stats.projects), icon: <FolderIcon />, gradient: 'linear-gradient(135deg, #1565c0, #42a5f5)', path: '/projects' },
  ]

  const taskStatusMap: Record<string, { label: string; color: 'info' | 'warning' | 'success' }> = {
    pending: { label: 'Pendente', color: 'info' },
    in_progress: { label: 'Em andamento', color: 'warning' },
    completed: { label: 'Concluída', color: 'success' },
  }

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.label}>
            <Card
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 44, height: 44, background: item.gradient, boxShadow: 2 }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Projetos Recentes</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/projects')}>
                Ver todos
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recentProjects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                Nenhum projeto cadastrado.
              </Typography>
            ) : (
              recentProjects.map((p, index) => (
                <Box key={p.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                    }}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #2e7d32, #66bb6a)' }}>
                      <FolderIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{p.codigo || 'Sem código'}</Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      color={p.status === 'ativo' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                  {index < recentProjects.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Próximas Tarefas</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/tasks')}>
                Ver todas
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recentTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                Nenhuma tarefa cadastrada.
              </Typography>
            ) : (
              recentTasks.map((t, index) => {
                const info = taskStatusMap[t.status] || { label: t.status, color: 'info' as const }
                return (
                  <Box key={t.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1976d2, #42a5f5)' }}>
                        <CheckCircleIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.dueAt ? `Vence em ${new Date(t.dueAt).toLocaleDateString('pt-BR')}` : 'Sem prazo'}
                        </Typography>
                      </Box>
                      <Chip size="small" label={info.label} color={info.color} variant="outlined" />
                    </Box>
                    {index < recentTasks.length - 1 && <Divider />}
                  </Box>
                )
              })
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

function ProjectDashboard({ projectId }: { projectId: number }) {
  const navigate = useNavigate()
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

  const statsCards: StatCard[] = [
    { label: 'Estações', value: String(stations.length), icon: <CellTowerIcon />, gradient: 'linear-gradient(135deg, #6a1b9a, #ab47bc)', path: `/projects/${projectId}` },
    { label: 'Enlaces de Rádio', value: String(radioLinks.length), icon: <SettingsInputAntennaIcon />, gradient: 'linear-gradient(135deg, #e65100, #ff9800)', path: `/projects/${projectId}` },
    { label: 'Documentos', value: String(documentsCount), icon: <DescriptionIcon />, gradient: 'linear-gradient(135deg, #00695c, #26a69a)', path: `/projects/${projectId}` },
    { label: 'Status', value: project?.status === 'ativo' ? 'Ativo' : 'Inativo', icon: <AssignmentIcon />, gradient: 'linear-gradient(135deg, #1565c0, #42a5f5)', path: `/projects/${projectId}` },
  ]

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statsCards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 44, height: 44, background: item.gradient, boxShadow: 2 }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Estações do Projeto</Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate(`/projects/${projectId}`)}>
                Ver projeto
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {stations.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                Nenhuma estação vinculada.
              </Typography>
            ) : (
              stations.map((s, index) => (
                <Box key={s.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                    }}
                    onClick={() => navigate(`/stations/${s.id}`)}
                  >
                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6a1b9a, #ab47bc)' }}>
                      <CellTowerIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {s.siteId} · {s.endId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{s.operadora || 'Sem operadora'}</Typography>
                    </Box>
                  </Box>
                  {index < stations.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Enlaces de Rádio do Projeto</Typography>
            <Divider sx={{ mb: 2 }} />
            {radioLinks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                Nenhum enlace vinculado.
              </Typography>
            ) : (
              radioLinks.map((rl, index) => (
                <Box key={rl.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                    }}
                    onClick={() => navigate(`/radio-links/${rl.id}`)}
                  >
                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #e65100, #ff9800)' }}>
                      <SettingsInputAntennaIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {rl.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rl.siteIdA || '-'} ↔ {rl.siteIdB || '-'}
                        {rl.frequencia ? ` · ${rl.frequencia}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                  {index < radioLinks.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { projectId, setProjectId } = useProject()
  const navigate = useNavigate()
  const isMaster = user?.role === 'master'

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 4,
          background: projectId
            ? 'linear-gradient(135deg, #065f46 0%, #047857 45%, #059669 100%)'
            : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #6d28d9 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -100, right: -60 }} />
        <Box sx={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -60, left: 80 }} />
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{today}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {projectId ? 'Dashboard do Projeto' : `Bem-vindo, ${user?.name}!`}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              {projectId
                ? 'Resumo das estações, enlaces e documentos deste projeto.'
                : 'Visão geral dos seus projetos, estações e enlaces de telecomunicações.'}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {projectId ? (
              <>
                <Button
                  variant="contained"
                  sx={{ bgcolor: 'white', color: '#047857', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                  onClick={() => navigate(`/projects/${projectId}`)}
                >
                  Abrir Projeto
                </Button>
                <Button
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
                  onClick={() => setProjectId(null)}
                >
                  Limpar Seleção
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ bgcolor: 'white', color: '#312e81', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                  onClick={() => navigate('/projects')}
                >
                  Novo Projeto
                </Button>
                <Button
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
                  onClick={() => navigate(isMaster ? '/finance' : '/tasks')}
                >
                  {isMaster ? 'Ver Finanças' : 'Ver Tarefas'}
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Paper>

      {projectId ? <ProjectDashboard projectId={projectId} /> : (isMaster ? <GlobalDashboard /> : <UserDashboard />)}
    </Container>
  )
}
