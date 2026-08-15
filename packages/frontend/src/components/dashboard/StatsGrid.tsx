import { Grid } from '@mui/material'
import StatCard, { StatCardConfig } from './StatCard'

export type { StatCardConfig }

interface StatsGridProps {
  cards: StatCardConfig[]
  columns?: number
}

export default function StatsGrid({ cards, columns = 4 }: StatsGridProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={columns} key={card.label}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  )
}
