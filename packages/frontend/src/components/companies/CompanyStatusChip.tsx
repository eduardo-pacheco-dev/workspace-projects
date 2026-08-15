import ActiveStatusChip from '../ui/ActiveStatusChip'

interface CompanyStatusChipProps {
  ativa: boolean
}

export default function CompanyStatusChip({ ativa }: CompanyStatusChipProps) {
  return <ActiveStatusChip status={ativa ? 'ativo' : 'inativo'} />
}
