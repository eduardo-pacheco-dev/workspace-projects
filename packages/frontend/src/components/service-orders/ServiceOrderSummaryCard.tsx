import { Box, Chip, Divider, Grid, IconButton, Paper, Typography } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import { ServiceOrder, statusLabels, statusColors } from '../../pages/service-orders/serviceOrdersTypes'
import InfoItem from '../ui/InfoItem'

interface ServiceOrderSummaryCardProps {
  order: ServiceOrder
}

export default function ServiceOrderSummaryCard({ order }: ServiceOrderSummaryCardProps) {
  const statusInfo = statusColors[order.status] || 'default'

  return (
    <Paper sx={{ p: 4, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <IconButton sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }} size="large">
          <AssignmentIcon />
        </IconButton>
        <Box>
          <Typography variant="h4">{order.numero}</Typography>
          <Chip label={statusLabels[order.status] || order.status} color={statusInfo} size="small" sx={{ mt: 0.5 }} />
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <InfoItem label="Cliente" value={order.cliente} md={6} />
        <InfoItem label="Operadora" value={order.operadora} md={6} />
        <InfoItem label="Site ID" value={order.siteId} md={6} />
        <InfoItem label="End ID" value={order.endId} md={6} />
        <InfoItem label="Data de Início" value={order.dataInicio} md={6} />
        <InfoItem label="Data de Fim" value={order.dataFim} md={6} />
        <InfoItem label="Descrição" value={order.descricao} md={12} />
        <InfoItem label="Observações" value={order.observacoes} md={12} />
        <InfoItem label="Criado em" value={order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : undefined} md={12} />
      </Grid>
    </Paper>
  )
}
