import { Link as RouterLink } from 'react-router-dom'
import { Button } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'

export default function GoogleButton() {
  return (
    <Button
      component={RouterLink}
      to="/auth/google"
      fullWidth
      variant="outlined"
      color="inherit"
      startIcon={<GoogleIcon />}
      sx={{ py: 1.4, borderRadius: 2, textTransform: 'none', fontSize: 16 }}
    >
      Continuar com Google
    </Button>
  )
}
