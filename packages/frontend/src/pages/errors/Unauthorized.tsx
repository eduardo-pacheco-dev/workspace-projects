import { Link as RouterLink } from 'react-router-dom'
import { Container, Typography, Button, Box } from '@mui/material'

export default function Unauthorized() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 12 }}>
      <Typography variant="h1" color="warning.main" sx={{ fontWeight: 700 }}>
        401
      </Typography>
      <Typography variant="h5" gutterBottom>
        Não autorizado
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Você não tem permissão para acessar esta página.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained">
          Voltar para o início
        </Button>
      </Box>
    </Container>
  )
}
