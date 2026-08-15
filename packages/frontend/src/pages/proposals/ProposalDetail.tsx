import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Grid, Typography } from '@mui/material'
import api from '../../services/api'
import InfoItem from '../../components/InfoItem'
import ProposalStatusChip from '../../components/proposals/ProposalStatusChip'
import { Proposal, formatRate } from './proposalsTypes'

export default function ProposalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/proposals/${id}`)
      .then((res) => setProposal(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!proposal) return <Container sx={{ mt: 4 }}><Alert severity="warning">Proposta não encontrada.</Alert></Container>

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes da Proposta</Typography>
            <ProposalStatusChip status={proposal.status} />
          </Box>
          <Grid container spacing={2}>
            <InfoItem label="ID" value={proposal.id} md={6} />
            <InfoItem label="ID do Job" value={proposal.jobId} md={6} />
            <InfoItem label="ID do Freelancer" value={proposal.freelancerId} md={6} />
            <InfoItem label="Taxa Proposta" value={formatRate(proposal.proposedRate)} md={6} />
            <InfoItem label="Duração Estimada" value={proposal.estimatedDuration || '-'} md={12} />
            <InfoItem label="Carta de Apresentação" value={proposal.coverLetter || '-'} md={12} />
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained" onClick={() => navigate(`/proposals/${id}/edit`)}>Editar</Button>
            <Button variant="outlined" onClick={() => navigate('/proposals')}>Voltar para a Lista</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
