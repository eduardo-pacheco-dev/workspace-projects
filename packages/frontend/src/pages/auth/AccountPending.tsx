import { Link as RouterLink } from 'react-router-dom'
import { Container, Typography, Button, Box, Paper } from '@mui/material'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'

export default function AccountPending() {
  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <HourglassTopIcon color="warning" sx={{ fontSize: 72, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Aguardando ativação
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sua conta ainda não foi ativada pelo administrador. Assim que for aprovada,
          você poderá acessar o painel normalmente.
        </Typography>
        <Box>
          <Button component={RouterLink} to="/signin" variant="contained" size="large">
            Voltar para o login
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
