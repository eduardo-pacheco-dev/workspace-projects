import { Chip } from '@mui/material'

interface CompanyStatusChipProps {
  ativa: boolean
}

export default function CompanyStatusChip({ ativa }: CompanyStatusChipProps) {
  return (
    <Chip size="small" label={ativa ? 'Ativa' : 'Inativa'} color={ativa ? 'success' : 'default'} />
  )
}
