import { Card, CardContent, Grid, Typography } from '@mui/material'
import { MsProjectDetail, weekdayLabels, formatDate } from '../../pages/ms-project/msProjectTypes'

interface PlanSummaryCardsProps {
  plan: MsProjectDetail
}

export default function PlanSummaryCards({ plan }: PlanSummaryCardsProps) {
  const stats = [
    { label: 'Início', value: formatDate(plan.startDate) },
    { label: 'Término', value: formatDate(plan.endDate) },
    { label: 'Duração', value: `${plan.durationDays ?? '-'} dias úteis` },
    { label: 'Dias úteis', value: plan.workingDays.map((d) => weekdayLabels[d]?.slice(0, 3)).join(', ') },
  ]

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat) => (
        <Grid item xs={6} sm={3} key={stat.label}>
          <Card variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{stat.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
