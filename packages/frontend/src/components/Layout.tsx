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
import WorkIcon from '@mui/icons-material/Work'
import SendIcon from '@mui/icons-material/Send'
import DescriptionIcon from '@mui/icons-material/Description'
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
    { label: 'Freelancers', path: '/freelancers', icon: <PersonIcon /> },
    { label: 'Jobs', path: '/freelancers?tab=1', icon: <WorkIcon /> },
    { label: 'Proposals', path: '/freelancers?tab=2', icon: <SendIcon /> },
    { label: 'Contracts', path: '/freelancers?tab=3', icon: <DescriptionIcon /> },
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
