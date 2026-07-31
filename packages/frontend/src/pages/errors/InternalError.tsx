import { Link as RouterLink } from 'react-router-dom'
import { Container, Typography, Button, Box } from '@mui/material'

export default function InternalError() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 12 }}>
      <Typography variant="h1" color="error" sx={{ fontWeight: 700 }}>
        500
      </Typography>
      <Typography variant="h5" gutterBottom>
        Erro interno do servidor
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Algo deu errado. Tente novamente em alguns instantes.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained">
          Voltar para o início
        </Button>
      </Box>
    </Container>
  )
}
