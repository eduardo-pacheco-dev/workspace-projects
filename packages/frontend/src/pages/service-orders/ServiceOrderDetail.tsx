import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
  Chip,
  Paper,
  Grid,
  Divider,
  IconButton,
} from '@mui/material'
import { ArrowBack, Edit, Assignment } from '@mui/icons-material'
import api from '../../services/api'

interface ServiceOrder {
  id: number
  numero: string
  cliente: string
  descricao: string | null
  siteId: string | null
  endId: string | null
  operadora: string | null
  dataInicio: string | null
  dataFim: string | null
  status: string
  observacoes: string | null
  createdAt: string
}

const statusMap: Record<string, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  aberta: { label: 'Aberta', color: 'info' },
  em_andamento: { label: 'Em andamento', color: 'warning' },
  concluida: { label: 'Concluída', color: 'success' },
  cancelada: { label: 'Cancelada', color: 'error' },
}

export default function ServiceOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/service-orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!order) return <Container sx={{ mt: 4 }}><Alert severity="warning">Ordem de serviço não encontrada.</Alert></Container>

  const statusInfo = statusMap[order.status] || { label: order.status, color: 'default' as const }

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

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <IconButton sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }} size="large">
            <Assignment />
          </IconButton>
          <Box>
            <Typography variant="h4">{order.numero}</Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
            <Typography variant="body1" gutterBottom>{order.cliente}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Operadora</Typography>
            <Typography variant="body1" gutterBottom>{order.operadora || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Site ID</Typography>
            <Typography variant="body1" gutterBottom>{order.siteId || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">End ID</Typography>
            <Typography variant="body1" gutterBottom>{order.endId || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Data de Início</Typography>
            <Typography variant="body1" gutterBottom>{order.dataInicio || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Data de Fim</Typography>
            <Typography variant="body1" gutterBottom>{order.dataFim || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Descrição</Typography>
            <Typography variant="body1" gutterBottom>{order.descricao || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Observações</Typography>
            <Typography variant="body1" gutterBottom>{order.observacoes || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Criado em</Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(order.createdAt).toLocaleString('pt-BR')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/service-orders')}>
          Voltar para a Lista
        </Button>
      </Box>
    </Container>
  )
}
