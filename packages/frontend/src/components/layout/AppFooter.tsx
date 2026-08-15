import { Box, Typography } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'

export default function AppFooter() {
  const { user } = useAuth()

  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        px: 3,
        borderTop: '1px solid rgba(0,0,0,0.08)',
        bgcolor: 'background.paper',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} {user?.companyName || 'Master'} — Sistema de Telecomunicações
      </Typography>
      <Typography variant="caption" color="text.secondary">
        v1.0.0
      </Typography>
    </Box>
  )
}
