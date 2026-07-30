import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Box,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import api from '../../services/api'

interface Proposal {
  id: number
  jobId: number
  freelancerId: number
  proposedRate: number
  status: string
}

export default function ProposalList() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/proposals')
      .then((res) => setProposals(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar a lista.'))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return
    try {
      await api.delete(`/proposals/${id}`)
      setProposals((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Proposals</Typography>
        <Button variant="contained" onClick={() => navigate('/proposals/new')}>New Proposal</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Freelancer ID</TableCell>
              <TableCell>Proposed Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proposals.map((p) => (
              <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/proposals/${p.id}`)}>
                <TableCell>{p.jobId}</TableCell>
                <TableCell>{p.freelancerId}</TableCell>
                <TableCell>${p.proposedRate}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/proposals/${p.id}/edit`) }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
