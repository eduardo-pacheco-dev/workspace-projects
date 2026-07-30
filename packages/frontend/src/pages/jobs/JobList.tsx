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

interface Job {
  id: number
  title: string
  description: string
  budget: number
  budgetType: string
  status: string
  skills: string[]
}

interface Props {
  onNew: () => void
  onEdit: (id: number) => void
}

export default function JobList({ onNew, onEdit }: Props) {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar a lista.'))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este job?')) return
    try {
      await api.delete(`/jobs/${id}`)
      setJobs((prev) => prev.filter((j) => j.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Jobs</Typography>
        <Button variant="contained" onClick={onNew}>Novo Job</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Orçamento</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Habilidades</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${j.id}`)}>
                <TableCell>{j.title}</TableCell>
                <TableCell>${j.budget}</TableCell>
                <TableCell>{j.budgetType === 'hourly' ? 'Por Hora' : 'Fixo'}</TableCell>
                <TableCell>{j.status}</TableCell>
                <TableCell>{Array.isArray(j.skills) ? j.skills.join(', ') : j.skills}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); onEdit(j.id) }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(j.id) }}>
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
