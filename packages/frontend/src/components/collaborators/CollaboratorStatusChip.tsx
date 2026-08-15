import { Chip } from '@mui/material'

interface CollaboratorStatusChipProps {
  status: string
}

export default function CollaboratorStatusChip({ status }: CollaboratorStatusChipProps) {
  const active = status === 'ativo'
  return (
    <Chip size="small" label={active ? 'Ativo' : 'Inativo'} color={active ? 'success' : 'default'} />
  )
}
