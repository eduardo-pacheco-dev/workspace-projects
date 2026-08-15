import StatusChip from './StatusChip'

interface ActiveStatusChipProps {
  status: string
}

const ACTIVE_LABELS: Record<string, string> = { ativo: 'Ativo', inativo: 'Inativo' }
const ACTIVE_COLORS: Record<string, 'success' | 'default'> = { ativo: 'success', inativo: 'default' }

export default function ActiveStatusChip({ status }: ActiveStatusChipProps) {
  return <StatusChip value={status === 'ativo' ? 'ativo' : 'inativo'} labels={ACTIVE_LABELS} colors={ACTIVE_COLORS} />
}
