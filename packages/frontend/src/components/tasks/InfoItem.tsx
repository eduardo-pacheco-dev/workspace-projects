import { Grid, Typography } from '@mui/material'

interface InfoItemProps {
  label: string
  value?: string | number | null
}

export default function InfoItem({ label, value }: InfoItemProps) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" gutterBottom>{value || '-'}</Typography>
    </Grid>
  )
}
