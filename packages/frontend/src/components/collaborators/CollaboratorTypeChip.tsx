import StatusChip from '../ui/StatusChip'

interface CollaboratorTypeChipProps {
  isFreelancer: boolean
}

const TYPE_LABELS: Record<string, string> = { freelancer: 'Freelancer', colaborador: 'Colaborador' }
const TYPE_COLORS: Record<string, 'secondary' | 'default'> = { freelancer: 'secondary' }

export default function CollaboratorTypeChip({ isFreelancer }: CollaboratorTypeChipProps) {
  const value = isFreelancer ? 'freelancer' : 'colaborador'
  return <StatusChip value={value} labels={TYPE_LABELS} colors={TYPE_COLORS} variant="outlined" />
}
