import { Chip } from '@mui/material'
import { roleLabels } from '../../pages/settings/roleModules'

interface RoleChipProps {
  role?: string
}

export default function RoleChip({ role }: RoleChipProps) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={role ? (roleLabels[role] || role) : '-'}
      color={role === 'master' ? 'primary' : 'default'}
    />
  )
}
