import { Box, Typography } from '@mui/material'

interface CollaboratorSectionProps {
  label: string
  children: React.ReactNode
}

export default function CollaboratorSection({ label, children }: CollaboratorSectionProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 2, mt: 1 }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  )
}
