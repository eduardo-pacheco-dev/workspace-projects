import { Chip } from '@mui/material'
import {
  faseLabels,
  statusCicloLabels,
  statusAcaoLabels,
  statusValidacaoLabels,
  faseColors,
  statusCicloColors,
  statusAcaoColors,
  statusValidacaoColors,
} from '../../pages/pdca/pdcaTypes'

type PdcaChipKind = 'fase' | 'statusCiclo' | 'statusAcao' | 'statusValidacao'

interface PdcaChipProps {
  kind: PdcaChipKind
  value: string
}

const LABELS: Record<PdcaChipKind, Record<string, string>> = {
  fase: faseLabels,
  statusCiclo: statusCicloLabels,
  statusAcao: statusAcaoLabels,
  statusValidacao: statusValidacaoLabels,
}

const COLORS: Record<PdcaChipKind, Record<string, 'default' | 'info' | 'primary' | 'success' | 'warning' | 'error'>> = {
  fase: faseColors,
  statusCiclo: statusCicloColors,
  statusAcao: statusAcaoColors,
  statusValidacao: statusValidacaoColors,
}

export default function PdcaChip({ kind, value }: PdcaChipProps) {
  return (
    <Chip size="small" label={LABELS[kind][value] || value} color={COLORS[kind][value] || 'default'} />
  )
}
