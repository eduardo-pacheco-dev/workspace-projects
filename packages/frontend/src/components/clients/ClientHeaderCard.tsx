import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { Client } from '../../pages/clients/clientsTypes'
import ClientStatusChip from './ClientStatusChip'

interface ClientHeaderCardProps {
  client: Client
  onEdit: () => void
  onDelete: () => void
}

export default function ClientHeaderCard({ client, onEdit, onDelete }: ClientHeaderCardProps) {
  return (
    <Card sx={{ mb: 3, bgcolor: 'rgba(21, 101, 192, 0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4">{client.nome}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {client.cidade || 'Sem cidade'}
                {client.uf ? `/${client.uf}` : ''}
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
          <ClientStatusChip status={client.status} />
        </Box>
      </CardContent>
    </Card>
  )
}
