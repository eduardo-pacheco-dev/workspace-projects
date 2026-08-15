import { Chip } from '@mui/material'

interface UserStatusChipProps {
  status: string
}

export default function UserStatusChip({ status }: UserStatusChipProps) {
  const active = status === 'active'
  return (
    <Chip size="small" label={active ? 'Ativo' : 'Inativo'} color={active ? 'success' : 'default'} />
  )
}
