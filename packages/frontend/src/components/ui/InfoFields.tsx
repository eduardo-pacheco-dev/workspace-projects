import { Divider, Grid, Paper, Typography } from '@mui/material'

interface InfoFieldsProps {
  title: string
  fields: { label: string; value: string }[]
}

export default function InfoFields({ title, fields }: InfoFieldsProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} sm={6} key={field.label}>
            <Typography variant="subtitle2" color="text.secondary">
              {field.label}
            </Typography>
            <Typography variant="body1">{field.value}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
