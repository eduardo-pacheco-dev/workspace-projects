import { Divider, Grid, Paper, Typography } from '@mui/material'

interface PdcaInfoSectionProps {
  title: string
  children: React.ReactNode
}

export default function PdcaInfoSection({ title, children }: PdcaInfoSectionProps) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Paper>
  )
}
