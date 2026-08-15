import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../../contexts/AuthContext'
import { getInitials } from '../../utils/format'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const close = () => setAnchorEl(null)

  const goProfile = () => {
    navigate('/profile')
    close()
  }

  const goLogout = () => {
    close()
    logout()
  }

  return (
    <>
      <Tooltip title="Conta">
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1,
            py: 0.5,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'background-color 0.15s ease',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
          }}
        >
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Avatar sx={{ width: 30, height: 30, bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontSize: 13 }}>
            {getInitials(user?.name || '')}
          </Avatar>
        </Box>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { elevation: 0, sx: { border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: 2, mt: 0.5 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={goProfile}>
          <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}><AccountCircleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={goLogout}>
          <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Sair</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
