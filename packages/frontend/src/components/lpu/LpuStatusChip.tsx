import { Chip } from '@mui/material'

interface LpuStatusChipProps {
  status: string
}

export default function LpuStatusChip({ status }: LpuStatusChipProps) {
  const active = status === 'ativo'
  return (
    <Chip size="small" label={active ? 'Ativo' : 'Inativo'} color={active ? 'success' : 'default'} />
  )
}
