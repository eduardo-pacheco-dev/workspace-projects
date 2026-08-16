import DashboardIcon from '@mui/icons-material/Dashboard'
import EventIcon from '@mui/icons-material/Event'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TimelineIcon from '@mui/icons-material/Timeline'
import GroupIcon from '@mui/icons-material/Group'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PersonIcon from '@mui/icons-material/Person'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CellTowerIcon from '@mui/icons-material/CellTower'
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna'
import FolderIcon from '@mui/icons-material/Folder'
import LoopIcon from '@mui/icons-material/Loop'
import BusinessIcon from '@mui/icons-material/Business'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications'

export interface MenuItemConfig {
  label: string
  path: string
  icon: React.ReactNode
  module?: string
  masterOnly?: boolean
}

export const allItems: MenuItemConfig[] = [
  { label: 'Início', path: '/', icon: <DashboardIcon /> },
  { label: 'Agenda', path: '/schedule', icon: <EventIcon />, module: '/schedule' },
  { label: 'Tarefas', path: '/tasks', icon: <CheckCircleIcon />, module: '/tasks' },
  { label: 'Cronograma', path: '/ms-project', icon: <TimelineIcon />, module: '/ms-project' },
  { label: 'Usuários', path: '/users', icon: <GroupIcon />, module: '/users' },
  { label: 'Ordens de Serviço', path: '/service-orders', icon: <AssignmentIcon />, module: '/service-orders' },
  { label: 'Colaboradores', path: '/collaborators', icon: <PersonIcon />, module: '/collaborators' },
  { label: 'Finanças', path: '/finance', icon: <AttachMoneyIcon />, module: '/finance' },
  { label: 'Estações', path: '/stations', icon: <CellTowerIcon />, module: '/stations' },
  { label: 'Enlaces de Rádio', path: '/radio-links', icon: <SettingsInputAntennaIcon />, module: '/radio-links' },
  { label: 'Projetos', path: '/projects', icon: <FolderIcon />, module: '/projects' },
  { label: 'PDCA', path: '/pdca', icon: <LoopIcon />, module: '/pdca' },
  { label: 'Clientes', path: '/clients', icon: <BusinessIcon />, module: '/clients' },
  { label: 'LPUs', path: '/lpus', icon: <ReceiptLongIcon />, module: '/lpus' },
  { label: 'Empresas', path: '/companies', icon: <CorporateFareIcon />, masterOnly: true },
  { label: 'Configurações', path: '/settings', icon: <SettingsApplicationsIcon />, module: '/settings' },
]

export function visibleItems(role: string | undefined, modules: string[]): MenuItemConfig[] {
  return role === 'master'
    ? allItems
    : allItems.filter((item) => !item.masterOnly && (!item.module || modules.includes(item.module)))
}
