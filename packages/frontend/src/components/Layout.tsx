import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CellTowerIcon from '@mui/icons-material/CellTower'
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const go = (path: string) => {
    navigate(path)
    handleClose()
  }

  const items = [
    { label: 'Usuários', path: '/users', icon: <GroupIcon /> },
    { label: 'Ordens de Serviço', path: '/service-orders', icon: <AssignmentIcon /> },
    { label: 'Freelancers', path: '/freelancers', icon: <PersonIcon /> },
    { label: 'Finanças', path: '/finance', icon: <AttachMoneyIcon /> },
    { label: 'Estações', path: '/stations', icon: <CellTowerIcon /> },
    { label: 'Enlaces de Rádio', path: '/radio-links', icon: <SettingsInputAntennaIcon /> },
  ]

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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            App
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.name}</Typography>
          <Button color="inherit" onClick={logout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>{children}</Box>
    </>
  )
}
