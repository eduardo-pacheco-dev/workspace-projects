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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>
          {title}
        </Typography>
        {end.operadora && (
          <Chip
            size="small"
            variant="outlined"
            label={end.operadora}
            color={operadoraColors[end.operadora] || 'default'}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} sm={6} key={field.label}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                lineHeight: 1.2,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {field.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {field.value}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}
