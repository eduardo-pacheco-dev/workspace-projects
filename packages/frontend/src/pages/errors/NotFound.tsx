import { Link as RouterLink } from 'react-router-dom'
import { Container, Typography, Button, Box } from '@mui/material'

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 12 }}>
      <Typography variant="h1" color="primary" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Página não encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        A página que você procura não existe ou foi movida.
      </Typography>
      <Box>
        <Button component={RouterLink} to="/" variant="contained">
          Voltar para o início
        </Button>
      </Box>
    </Container>
  )
}
