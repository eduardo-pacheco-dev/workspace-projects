import { Grid, Typography } from '@mui/material'

interface InfoItemProps {
  label: string
  value?: string | number | null
  md?: number
}

export default function InfoItem({ label, value, md = 4 }: InfoItemProps) {
  return (
    <Grid item xs={12} sm={6} md={md}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" gutterBottom>{value || '-'}</Typography>
    </Grid>
  )
}
