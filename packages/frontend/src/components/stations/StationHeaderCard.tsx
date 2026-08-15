import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import CellTowerIcon from '@mui/icons-material/CellTower'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { Station, mobileCarrierColors } from '../../pages/stations/stationsTypes'

interface StationHeaderCardProps {
  station: Station
  onEdit: () => void
  onDelete: () => void
}

export default function StationHeaderCard({ station, onEdit, onDelete }: StationHeaderCardProps) {
  return (
    <Card sx={{ mb: 3, bgcolor: 'rgba(21, 101, 192, 0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CellTowerIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4">{station.siteId}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  size="small"
                  label={station.mobileCarrier || 'Sem operadora'}
                  color={mobileCarrierColors[station.mobileCarrier || ''] || 'default'}
                />
                {station.mobileCarrier === 'TIM' && (
                  <Typography variant="subtitle1" color="text.secondary">
                    · {station.endId}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Box>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit} sx={{ mr: 1 }}>
              Editar
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
              Excluir
            </Button>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Chip
            label={station.status === 'ativo' ? 'Ativo' : 'Inativo'}
            color={station.status === 'ativo' ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  )
}
