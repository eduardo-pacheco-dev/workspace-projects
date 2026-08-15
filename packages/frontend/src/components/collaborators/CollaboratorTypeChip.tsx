import { Chip } from '@mui/material'

interface CollaboratorTypeChipProps {
  isFreelancer: boolean
}

export default function CollaboratorTypeChip({ isFreelancer }: CollaboratorTypeChipProps) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={isFreelancer ? 'Freelancer' : 'Colaborador'}
      color={isFreelancer ? 'secondary' : 'default'}
    />
  )
}
