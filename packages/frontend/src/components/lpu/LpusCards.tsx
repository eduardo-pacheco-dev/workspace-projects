import { Grid } from '@mui/material'
import CardsGrid from '../ui/CardsGrid'
import EntityCard from '../ui/EntityCard'
import LpuStatusChip from './LpuStatusChip'
import { Lpu, formatValor } from '../../pages/lpu/lpuTypes'

interface LpusCardsProps {
  lpus: Lpu[]
  onEdit: (lpu: Lpu) => void
  onDelete: (lpu: Lpu) => void
}

export default function LpusCards({ lpus, onEdit, onDelete }: LpusCardsProps) {
  return (
    <CardsGrid empty={lpus.length === 0} emptyMessage="Nenhuma LPU encontrada.">
      {lpus.map((lpu) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={lpu.id}>
          <EntityCard
            title={lpu.nome}
            subtitle={lpu.freelancer?.nome || 'Sem freelancer'}
            initials={lpu.nome}
            status={<LpuStatusChip status={lpu.status} />}
            details={[
              `Valor: ${formatValor(lpu.valor)}`,
              `Data: ${lpu.data || '-'}`,
              ...(lpu.descricao ? [lpu.descricao] : []),
            ]}
            onEdit={() => onEdit(lpu)}
            onDelete={() => onDelete(lpu)}
          />
        </Grid>
      ))}
    </CardsGrid>
  )
}
