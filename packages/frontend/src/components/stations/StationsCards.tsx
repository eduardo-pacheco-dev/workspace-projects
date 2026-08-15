import { Avatar, Box, Card, CardActions, CardContent, Chip, Divider, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete, SignalCellularAlt, Place, Public } from '@mui/icons-material'
import { Station } from '../../pages/stations/stationsTypes'
import { getInitials } from '../../utils/format'
import Button from '../ui/Button'

interface StationsCardsProps {
  stations: Station[]
  onOpen: (station: Station) => void
  onEdit: (station: Station) => void
  onDelete: (station: Station) => void
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  value: string
}

function Field({ icon, label, value }: FieldProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
      <Box sx={{ color: 'rgb(0, 21, 68)', display: 'flex', fontSize: 18 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
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
          {label}
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

export default function StationsCards({ stations, onOpen, onEdit, onDelete }: StationsCardsProps) {
  if (stations.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
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
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
              }}
              onClick={() => onOpen(station)}
            >
              <Box sx={{ bgcolor: 'rgb(0, 21, 68)', px: 2, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    width: 42,
                    height: 42,
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {getInitials(station.siteId)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                    {station.siteId}
                  </Typography>
                  <Typography noWrap variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {endId}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={station.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={station.status === 'ativo' ? 'success' : 'default'}
                  sx={{ fontWeight: 600, bgcolor: station.status === 'ativo' ? undefined : 'rgba(255,255,255,0.85)' }}
                />
              </Box>

              <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                <Field
                  icon={<SignalCellularAlt fontSize="inherit" />}
                  label="Operadora"
                  value={station.mobileCarrier || '-'}
                />
                <Divider sx={{ my: 0.5 }} />
                <Field icon={<Place fontSize="inherit" />} label="Endereço" value={station.address || '-'} />
                <Divider sx={{ my: 0.5 }} />
                <Field
                  icon={<Public fontSize="inherit" />}
                  label="Coordenadas"
                  value={hasCoords ? `${station.latitude!.toFixed(5)}, ${station.longitude!.toFixed(5)}` : 'Não informadas'}
                />
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1.5 }}>
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
