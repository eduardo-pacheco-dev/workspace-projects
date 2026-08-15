import { Box } from '@mui/material'
import SectionTitle from '../ui/SectionTitle'

interface CollaboratorSectionProps {
  label: string
  children: React.ReactNode
}

export default function CollaboratorSection({ label, children }: CollaboratorSectionProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <SectionTitle label={label} />
      {children}
    </Box>
  )
}
