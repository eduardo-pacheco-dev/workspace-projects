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
            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
          }}
        >
          <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: 14 }}>
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
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={goProfile}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={goLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Sair</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
