import { Button as MuiButton, ButtonProps } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const PRIMARY = 'rgb(0, 21, 68)'

const MODERN_STYLE = {
  borderRadius: 6,
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
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  '&:focus-visible': {
    outline: '2px solid rgba(0, 21, 68, 0.6)',
    outlineOffset: 2,
  },
}

const HOVER_LIFT = {
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
}

function primaryStyle(variant: NonNullable<ButtonProps['variant']>) {
  switch (variant) {
    case 'contained':
      return {
        bgcolor: PRIMARY,
        color: '#fff',
        '&:hover': { ...HOVER_LIFT, bgcolor: 'rgba(0, 21, 68, 0.88)' },
      }
    case 'outlined':
      return {
        color: PRIMARY,
        borderColor: PRIMARY,
        '&:hover': { ...HOVER_LIFT, borderColor: PRIMARY, bgcolor: 'rgba(0, 21, 68, 0.05)' },
      }
    default:
      return {
        color: PRIMARY,
        '&:hover': { bgcolor: 'rgba(0, 21, 68, 0.05)' },
      }
  }
}

interface RouterButtonProps extends ButtonProps {
  to?: string
}

export default function Button({ to, component, variant = 'text', color, sx, ...props }: RouterButtonProps) {
  const themed = color == null ? primaryStyle(variant) : {}
  const extraProps: Record<string, unknown> = {}
  if (to) extraProps.to = to

  return (
    <MuiButton
      variant={variant}
      color={color}
      component={to ? RouterLink : component}
      {...(extraProps as any)}
      {...props}
      sx={{ ...MODERN_STYLE, ...themed, ...sx }}
    />
  )
}
