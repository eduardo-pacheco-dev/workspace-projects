import { Box, Typography } from '@mui/material'

interface PageToolbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function PageToolbar({ title, subtitle, actions }: PageToolbarProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Box>
        <Typography variant="h4">{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
    </Box>
  )
}
