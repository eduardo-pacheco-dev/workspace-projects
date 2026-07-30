import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            App
          </Typography>
          <Button color="inherit" onClick={logout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4">
            Bem-vindo, {user?.name}!
          </Typography>
        </Box>
      </Container>
    </>
  )
}
