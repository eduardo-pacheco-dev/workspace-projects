import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import { formatCurrency } from '../../utils/format'

export interface SummaryCardItem {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  bg: string
}

interface SummaryCardsProps {
  cards: SummaryCardItem[]
}

export default function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.label}>
          <Card sx={{ bgcolor: card.bg }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">{card.label}</Typography>
                <Typography variant="h6" sx={{ color: card.color }}>
                  {formatCurrency(card.value)}
                </Typography>
              </Box>
              <Box sx={{ color: card.color }}>{card.icon}</Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
