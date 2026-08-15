import { Chip } from '@mui/material'

interface ClientStatusChipProps {
  status: string
}

export default function ClientStatusChip({ status }: ClientStatusChipProps) {
  const active = status === 'ativo'
  return (
    <Chip size="small" label={active ? 'Ativo' : 'Inativo'} color={active ? 'success' : 'default'} />
  )
}
