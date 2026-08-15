import { AppBar, Box, Toolbar, Typography } from '@mui/material'
import NavigationMenu from './NavigationMenu'
import ProjectSelector from './ProjectSelector'
import UserMenu from './UserMenu'

export default function AppHeader() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
            AFL
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, color: 'text.secondary' }}>
            Engenharia
          </Typography>
        </Box>
        <NavigationMenu />
        <ProjectSelector />
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
