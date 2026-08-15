import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
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
      <Tooltip title="Menu">
        <IconButton
          color="inherit"
          edge="start"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ mr: { xs: 1, sm: 2 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        slotProps={{ paper: { elevation: 0, sx: { border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: 2, mt: 0.5 } } }}
      >
        {visibleItems(user?.role, modules).map((item) => (
          <MenuItem key={item.path} onClick={() => go(item.path)}>
            <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
