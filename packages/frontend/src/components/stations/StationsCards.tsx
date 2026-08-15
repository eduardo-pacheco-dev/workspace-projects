import { Avatar, Box, Button, Card, CardActions, CardContent, Chip, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { Station } from '../../pages/stations/stationsTypes'
import { getInitials } from '../../utils/format'

interface StationsCardsProps {
  stations: Station[]
  onOpen: (station: Station) => void
  onEdit: (station: Station) => void
  onDelete: (station: Station) => void
}

export default function StationsCards({ stations, onOpen, onEdit, onDelete }: StationsCardsProps) {
  if (stations.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Nenhuma estação encontrada.</Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      {stations.map((station) => {
        const hasCoords = station.latitude != null && station.longitude != null
        const endId = station.mobileCarrier === 'TIM' ? station.endId : '-'
        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={station.id}>
            <Card
              variant="outlined"
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              onClick={() => onOpen(station)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                    {getInitials(station.siteId)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                      {station.siteId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {endId}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" variant="outlined" label={station.mobileCarrier || '-'} />
                  <Chip
                    size="small"
                    label={station.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={station.status === 'ativo' ? 'success' : 'default'}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Endereço: {station.address || '-'}
                </Typography>
                {hasCoords && (
                  <Typography variant="body2" color="text.secondary">
                    Coordenadas: {station.latitude!.toFixed(5)}, {station.longitude!.toFixed(5)}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(station)
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(station)
                  }}
                >
                  Excluir
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}
