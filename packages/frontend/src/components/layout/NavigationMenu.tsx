import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Grid, IconButton, Popover, Tooltip, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuth } from '../../contexts/AuthContext'
import { useUserModules } from '../../hooks/useUserModules'
import { visibleItems } from './menuItems'

export default function NavigationMenu() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const modules = useUserModules()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const items = visibleItems(user?.role, modules)

  const close = () => setAnchorEl(null)

  const go = (path: string) => {
    navigate(path)
    close()
  }

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

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
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              p: 2,
              mt: 0.5,
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        <Grid container spacing={1} sx={{ width: 300 }}>
          {items.map((item) => {
            const active = isActive(item.path)
            return (
              <Grid item key={item.path} xs={4}>
                <Box
                  onClick={() => go(item.path)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    minHeight: 86,
                    borderRadius: 1,
                    cursor: 'pointer',
                    color: active ? 'rgb(0, 21, 68)' : 'text.secondary',
                    bgcolor: active ? 'rgba(0, 21, 68, 0.08)' : 'transparent',
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: active ? 'rgba(0, 21, 68, 0.12)' : 'action.hover' },
                  }}
                >
                  <Box sx={{ fontSize: 26, display: 'flex', lineHeight: 1 }}>{item.icon}</Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: active ? 700 : 500, textAlign: 'center', lineHeight: 1.2, px: 0.5 }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Popover>
    </>
  )
}
