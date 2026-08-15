import { Chip } from '@mui/material'

interface LinkStatusChipProps {
  status: string
}

export default function LinkStatusChip({ status }: LinkStatusChipProps) {
  const active = status === 'ativo'
  return (
    <Chip size="small" label={active ? 'Ativo' : 'Inativo'} color={active ? 'success' : 'default'} />
  )
}
