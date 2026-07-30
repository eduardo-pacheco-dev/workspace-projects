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

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/jobs')
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error loading jobs.'))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    try {
      await api.delete(`/jobs/${id}`)
      setJobs((prev) => prev.filter((j) => j.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting job.')
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Jobs</Typography>
        <Button variant="contained" onClick={() => navigate('/jobs/new')}>New Job</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Budget Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((j) => (
              <TableRow key={j.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${j.id}`)}>
                <TableCell>{j.title}</TableCell>
                <TableCell>${j.budget}</TableCell>
                <TableCell>{j.budgetType}</TableCell>
                <TableCell>{j.status}</TableCell>
                <TableCell>{Array.isArray(j.skills) ? j.skills.join(', ') : j.skills}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${j.id}/edit`) }}>
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
