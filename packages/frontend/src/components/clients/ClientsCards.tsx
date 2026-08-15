import { Avatar, Box, Button, Card, CardActions, CardContent, Grid, Paper, Typography } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { Client } from '../../pages/clients/clientsTypes'
import { getInitials } from '../../utils/format'
import ClientStatusChip from './ClientStatusChip'

interface ClientsCardsProps {
  clients: Client[]
  onOpen: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export default function ClientsCards({ clients, onOpen, onEdit, onDelete }: ClientsCardsProps) {
  if (clients.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Nenhum cliente encontrado.</Typography>
      </Paper>
    )
  }

  return (
    <Grid container spacing={2}>
      {clients.map((client) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={client.id}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => onOpen(client)}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                  {getInitials(client.nome)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                    {client.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {client.email || '-'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 1 }}>
                <ClientStatusChip status={client.status} />
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                CNPJ: {client.documento || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Telefone: {client.telefone || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Cidade: {client.cidade || '-'}
                {client.uf ? `/${client.uf}` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Endereço: {client.endereco || '-'}
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(client)
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
                  onDelete(client)
                }}
              >
                Excluir
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
