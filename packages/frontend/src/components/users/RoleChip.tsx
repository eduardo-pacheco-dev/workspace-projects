import StatusChip from '../ui/StatusChip'
import { roleLabels } from '../../pages/settings/roleModules'

interface RoleChipProps {
  role?: string
}

const ROLE_COLORS: Record<string, 'primary' | 'default'> = { master: 'primary' }

export default function RoleChip({ role }: RoleChipProps) {
  return <StatusChip value={role || '-'} labels={roleLabels} colors={ROLE_COLORS} variant="outlined" />
}
