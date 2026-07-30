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

interface Freelancer {
  id: number
  userId: number
  title: string
  bio: string
  hourlyRate: number
  skills: string[]
  experienceLevel: string
  availability: string
  name?: string
}

export default function FreelancerList() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/freelancers')
      .then((res) => setFreelancers(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error loading freelancers.'))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this freelancer?')) return
    try {
      await api.delete(`/freelancers/${id}`)
      setFreelancers((prev) => prev.filter((f) => f.id !== id))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting freelancer.')
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Freelancers</Typography>
        <Button variant="contained" onClick={() => navigate('/freelancers/new')}>
          New Freelancer
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Hourly Rate</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {freelancers.map((f) => (
              <TableRow key={f.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/freelancers/${f.id}`)}>
                <TableCell>{f.name || f.userId}</TableCell>
                <TableCell>{f.title}</TableCell>
                <TableCell>${f.hourlyRate}</TableCell>
                <TableCell>{Array.isArray(f.skills) ? f.skills.join(', ') : f.skills}</TableCell>
                <TableCell>{f.experienceLevel}</TableCell>
                <TableCell>{f.availability}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); navigate(`/freelancers/${f.id}/edit`) }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(f.id) }}>
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
