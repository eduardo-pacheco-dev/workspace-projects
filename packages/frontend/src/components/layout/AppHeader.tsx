import { AppBar, Box, Toolbar, Typography } from '@mui/material'
import NavigationMenu from './NavigationMenu'
import UserMenu from './UserMenu'

export default function AppHeader() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgb(0, 21, 68)',
        color: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ px: { xs: 1.5, sm: 3 }, minHeight: { xs: 56, sm: 64 } }}>
        <NavigationMenu />
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              AFL Engenharia
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Sistema de Telecomunicações
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
