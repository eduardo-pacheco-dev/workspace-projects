import { Typography, Box } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h4">
        Bem-vindo, {user?.name}!
      </Typography>
    </Box>
  )
}
