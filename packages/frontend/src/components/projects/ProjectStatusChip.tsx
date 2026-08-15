import { Chip } from '@mui/material'

interface ProjectStatusChipProps {
  status: string
}

export default function ProjectStatusChip({ status }: ProjectStatusChipProps) {
  const active = status === 'ativo'
  return (
    <Chip size="small" label={active ? 'Ativo' : 'Inativo'} color={active ? 'success' : 'default'} />
  )
}
