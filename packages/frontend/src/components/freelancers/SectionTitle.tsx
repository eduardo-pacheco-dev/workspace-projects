import { Typography } from '@mui/material'

interface SectionTitleProps {
  label: string
}

export default function SectionTitle({ label }: SectionTitleProps) {
  return (
    <Typography
      variant="subtitle2"
      sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, mt: 1 }}
    >
      {label}
    </Typography>
  )
}
