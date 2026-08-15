import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { RadioLink } from '../../pages/radio-links/radioLinksTypes'
import LinkStatusChip from './LinkStatusChip'

interface RadioLinkHeaderCardProps {
  radioLink: RadioLink
  onEdit: () => void
  onDelete: () => void
}

export default function RadioLinkHeaderCard({ radioLink, onEdit, onDelete }: RadioLinkHeaderCardProps) {
  return (
    <Card sx={{ mb: 3, bgcolor: 'rgba(156, 39, 176, 0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsInputAntennaIcon color="secondary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4">{radioLink.nome}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {radioLink.frequencia || 'Sem frequência'}
                {radioLink.capacidade ? ` · ${radioLink.capacidade}` : ''}
              </Typography>
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
          <LinkStatusChip status={radioLink.status} />
        </Box>
      </CardContent>
    </Card>
  )
}
