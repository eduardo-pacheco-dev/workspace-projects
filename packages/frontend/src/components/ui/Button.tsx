import { Button as MuiButton, ButtonProps } from '@mui/material'

const MODERN_STYLE = {
  borderRadius: 10,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  py: 0.9,
  px: 2.5,
  transition: 'all 0.15s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  '&:focus-visible': {
    outline: '2px solid rgba(25, 118, 210, 0.6)',
    outlineOffset: 2,
  },
}

export default function Button({ sx, ...props }: ButtonProps) {
  return <MuiButton {...props} sx={{ ...MODERN_STYLE, ...sx }} />
}
