import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuth } from '../../contexts/AuthContext'
import { useUserModules } from '../../hooks/useUserModules'
import { visibleItems } from './menuItems'

export default function NavigationMenu() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const modules = useUserModules()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const close = () => setAnchorEl(null)

  const go = (path: string) => {
    navigate(path)
    close()
  }

  return (
    <>
      <IconButton color="inherit" edge="start" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ mr: 2 }}>
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        {visibleItems(user?.role, modules).map((item) => (
          <MenuItem key={item.path} onClick={() => go(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
