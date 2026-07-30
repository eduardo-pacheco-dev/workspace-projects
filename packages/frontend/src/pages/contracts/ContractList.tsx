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

interface Contract {
  id: number
  jobId: number
  freelancerId: number
  clientId: number
  totalBudget: number
  status: string
  startDate: string
}

export default function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/contracts')
      .then((res) => setContracts(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar a lista.'))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contract?')) return
    try {
      await api.delete(`/contracts/${id}`)
      setContracts((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Contracts</Typography>
        <Button variant="contained" onClick={() => navigate('/contracts/new')}>New Contract</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Freelancer ID</TableCell>
              <TableCell>Client ID</TableCell>
              <TableCell>Total Budget</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/contracts/${c.id}`)}>
                <TableCell>{c.jobId}</TableCell>
                <TableCell>{c.freelancerId}</TableCell>
                <TableCell>{c.clientId}</TableCell>
                <TableCell>${c.totalBudget}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>{c.startDate ? new Date(c.startDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${c.id}/edit`) }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }}>
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
