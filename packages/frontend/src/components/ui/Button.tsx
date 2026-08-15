import { Button as MuiButton, ButtonProps } from '@mui/material'

export default function Button({ sx, ...props }: ButtonProps) {
  return <MuiButton {...props} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, ...sx }} />
}
