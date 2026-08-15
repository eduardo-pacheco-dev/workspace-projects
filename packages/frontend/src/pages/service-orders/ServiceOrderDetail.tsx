import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Container, CircularProgress, IconButton, Typography } from '@mui/material'
import { ArrowBack, Edit } from '@mui/icons-material'
import api from '../../services/api'
import AttachmentsSection from '../../components/AttachmentsSection'
import ServiceOrderSummaryCard from '../../components/service-orders/ServiceOrderSummaryCard'
import ObservationsSection from '../../components/service-orders/ObservationsSection'
import CommentsSection from '../../components/service-orders/CommentsSection'
import { ServiceOrder } from './serviceOrdersTypes'

export default function ServiceOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    api.get(`/service-orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!order) return <Container sx={{ mt: 4 }}><Alert severity="warning">Ordem de serviço não encontrada.</Alert></Container>

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/service-orders')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes da Ordem de Serviço</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => navigate('/service-orders?edit=' + order.id)}>
          Editar
        </Button>
      </Box>

      <ServiceOrderSummaryCard order={order} />

      <AttachmentsSection resource="service-order" resourceId={order.id} onError={setError} />

      <ObservationsSection orderId={order.id} orderNumber={order.numero} />

      <CommentsSection orderId={order.id} onError={setError} />

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/service-orders')}>
          Voltar para a Lista
        </Button>
      </Box>
    </Container>
  )
}
