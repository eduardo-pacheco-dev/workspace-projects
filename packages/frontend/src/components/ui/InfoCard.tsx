import { Grid, Paper, Typography } from '@mui/material'
import InfoItem from './InfoItem'

interface InfoCardProps {
  title: string
  fields: { label: string; value: string }[]
}

export default function InfoCard({ title, fields }: InfoCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'rgb(0, 21, 68)' }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <InfoItem key={field.label} label={field.label} value={field.value} md={6} />
        ))}
      </Grid>
    </Paper>
  )
}
