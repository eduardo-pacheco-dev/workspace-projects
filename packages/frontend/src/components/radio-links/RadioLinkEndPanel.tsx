import { Box, Chip, Grid, Paper, Typography } from '@mui/material'
import { operadoraColors } from '../../pages/radio-links/radioLinksTypes'

export interface LinkEndpoint {
  siteId: string | null
  endId: string | null
  endereco: string | null
  latitude: number | null
  longitude: number | null
  operadora: string | null
}

interface RadioLinkEndPanelProps {
  title: string
  end: LinkEndpoint
}

export default function RadioLinkEndPanel({ title, end }: RadioLinkEndPanelProps) {
  const hasCoords = end.latitude != null && end.longitude != null
  const fields = [
    { label: 'Site ID', value: end.siteId || '-' },
    { label: 'End ID', value: end.endId || '-' },
    { label: 'Endereço', value: end.endereco || '-' },
    { label: 'Coordenadas', value: hasCoords ? `${end.latitude}, ${end.longitude}` : '-' },
  ]

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {end.operadora && (
          <Chip size="small" label={end.operadora} color={operadoraColors[end.operadora] || 'default'} />
        )}
      </Box>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} sm={6} key={field.label}>
            <Typography variant="subtitle2" color="text.secondary">
              {field.label}
            </Typography>
            <Typography variant="body1">{field.value}</Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
