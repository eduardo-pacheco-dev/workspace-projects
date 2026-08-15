import { useState, useEffect } from 'react'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Grid, Typography } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import InfoItem from '../../components/ui/InfoItem'
import ContractStatusChip from '../../components/contracts/ContractStatusChip'
import { Contract, formatBudget, formatContractDate } from './contractsTypes'

export default function ContractDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState<Contract | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/contracts/${id}`)
      .then((res) => setContract(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!contract) return <Container sx={{ mt: 4 }}><Alert severity="warning">Contrato não encontrado.</Alert></Container>

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes do Contrato</Typography>
            <ContractStatusChip status={contract.status} />
          </Box>
          <Grid container spacing={2}>
            <InfoItem label="ID" value={contract.id} md={6} />
            <InfoItem label="ID da Proposta" value={contract.proposalId || '-'} md={6} />
            <InfoItem label="ID do Job" value={contract.jobId} md={6} />
            <InfoItem label="ID do Freelancer" value={contract.freelancerId} md={6} />
            <InfoItem label="ID do Cliente" value={contract.clientId} md={6} />
            <InfoItem label="Orçamento Total" value={formatBudget(contract.totalBudget)} md={6} />
            <InfoItem label="Data de Início" value={formatContractDate(contract.startDate)} md={6} />
            <InfoItem label="Data de Término" value={formatContractDate(contract.endDate)} md={6} />
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained" onClick={() => navigate(`/contracts/${id}/edit`)}>Editar</Button>
            <Button variant="outlined" onClick={() => navigate('/contracts')}>Voltar para a Lista</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
