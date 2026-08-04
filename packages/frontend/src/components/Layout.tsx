import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Tooltip,
  Divider,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CellTowerIcon from '@mui/icons-material/CellTower'
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna'
import FolderIcon from '@mui/icons-material/Folder'
import BusinessIcon from '@mui/icons-material/Business'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EventIcon from '@mui/icons-material/Event'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TimelineIcon from '@mui/icons-material/Timeline'
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'

interface ProjectOption {
  id: number
  nome: string
  codigo: string | null
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { projectId, setProjectId } = useProject()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [projects, setProjects] = useState<ProjectOption[]>([])

  useEffect(() => {
    api.get('/projects', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setProjects(data)
      })
      .catch(() => {})
  }, [])

  const handleProjectChange = (e: SelectChangeEvent<number | ''>) => {
    const id = Number(e.target.value)
    setProjectId(id || null)
  }

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const go = (path: string) => {
    navigate(path)
    handleClose()
  }

  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(e.currentTarget)
  const handleUserMenuClose = () => setUserMenuAnchor(null)

  const handleProfile = () => {
    navigate('/profile')
    handleUserMenuClose()
  }

  const handleLogout = () => {
    handleUserMenuClose()
    logout()
  }

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const masterItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Agenda', path: '/schedule', icon: <EventIcon /> },
    { label: 'Tarefas', path: '/tasks', icon: <CheckCircleIcon /> },
    { label: 'Cronograma', path: '/ms-project', icon: <TimelineIcon /> },
    { label: 'Usuários', path: '/users', icon: <GroupIcon /> },
    { label: 'Ordens de Serviço', path: '/service-orders', icon: <AssignmentIcon /> },
    { label: 'Colaboradores', path: '/collaborators', icon: <PersonIcon /> },
    { label: 'Finanças', path: '/finance', icon: <AttachMoneyIcon /> },
    { label: 'Estações', path: '/stations', icon: <CellTowerIcon /> },
    { label: 'Enlaces de Rádio', path: '/radio-links', icon: <SettingsInputAntennaIcon /> },
    { label: 'Projetos', path: '/projects', icon: <FolderIcon /> },
    { label: 'Clientes', path: '/clients', icon: <BusinessIcon /> },
    { label: 'Empresas', path: '/companies', icon: <CorporateFareIcon /> },
    { label: 'Configurações', path: '/settings', icon: <SettingsApplicationsIcon /> },
  ]

  const userItems = [
    { label: 'Tarefas', path: '/tasks', icon: <CheckCircleIcon /> },
    { label: 'Ordens de Serviço', path: '/service-orders', icon: <AssignmentIcon /> },
    { label: 'Colaboradores', path: '/collaborators', icon: <PersonIcon /> },
    { label: 'Estações', path: '/stations', icon: <CellTowerIcon /> },
    { label: 'Enlaces de Rádio', path: '/radio-links', icon: <SettingsInputAntennaIcon /> },
    { label: 'Projetos', path: '/projects', icon: <FolderIcon /> },
  ]

  const items = user?.role === 'master' ? masterItems : userItems

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleMenu} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={handleClose}
          >
            {items.map((item) => (
              <MenuItem key={item.path} onClick={() => go(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <Select
              value={projectId ?? ''}
              onChange={handleProjectChange}
              displayEmpty
              variant="standard"
              sx={{
                color: 'white',
                minWidth: 200,
                '& .MuiSelect-icon': { color: 'white' },
                '&:before': { borderBottom: '1px solid rgba(255,255,255,0.5)' },
                '&:after': { borderBottom: '1px solid white' },
              }}
            >
              <MenuItem value="">
                <em>Selecionar Projeto</em>
              </MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nome}
                  {p.codigo ? ` (${p.codigo})` : ''}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Tooltip title="Conta">
            <Box
              onClick={handleUserMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                px: 1,
                py: 0.5,
                borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
              }}
            >
              <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: 14 }}>
                {initials}
              </Avatar>
            </Box>
          </Tooltip>
          <Menu
            anchorEl={userMenuAnchor}
            open={!!userMenuAnchor}
            onClose={handleUserMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfile}>
              <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Perfil</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          p: 3,
          minHeight: 'calc(100vh - 64px - 56px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
      </Box>
      <Box
        component="footer"
        sx={{
          py: 1.5,
          px: 3,
          borderTop: '1px solid rgba(0,0,0,0.08)',
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} {user?.companyName || 'Master'} — Sistema de Telecomunicações
        </Typography>
        <Typography variant="caption" color="text.secondary">
          v1.0.0
        </Typography>
      </Box>
    </>
  )
}
