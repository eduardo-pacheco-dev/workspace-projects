import GoogleIcon from '@mui/icons-material/Google'
import Button from '../ui/Button'

export default function GoogleButton() {
  return (
    <Button
      to="/auth/google"
      fullWidth
      variant="outlined"
      color="inherit"
      startIcon={<GoogleIcon />}
      sx={{ py: 1.4, fontSize: 16 }}
    >
      Continuar com Google
    </Button>
  )
}
