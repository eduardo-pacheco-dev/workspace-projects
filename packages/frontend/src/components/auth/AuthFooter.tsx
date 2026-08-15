import { Link as RouterLink } from 'react-router-dom'
import { Box, Link, Typography } from '@mui/material'

interface AuthFooterProps {
  message: string
  linkText: string
  linkTo: string
}

export default function AuthFooter({ message, linkText, linkTo }: AuthFooterProps) {
  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>
      <Typography variant="body2" color="text.secondary">
        {message}{' '}
        <Link component={RouterLink} to={linkTo} variant="body2" underline="hover" fontWeight={600}>
          {linkText}
        </Link>
      </Typography>
    </Box>
  )
}
