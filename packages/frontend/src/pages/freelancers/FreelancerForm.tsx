import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import api from '../../services/api'

export default function FreelancerForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [skills, setSkills] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('junior')
  const [availability, setAvailability] = useState('available')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/collaborators/${id}`)
        .then((res) => {
          const data = res.data
          setUserId(String(data.userId))
          setTitle(data.title || '')
          setBio(data.bio || '')
          setHourlyRate(data.hourlyRate ? String(data.hourlyRate) : '')
          setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '')
          setExperienceLevel(data.experienceLevel || 'junior')
          setAvailability(data.availability || 'available')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [id, isEdit])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      userId: Number(userId),
      title,
      bio,
      hourlyRate: Number(hourlyRate),
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      experienceLevel,
      availability,
      isFreelancer: true,
    }

    try {
      if (isEdit) {
        await api.patch(`/collaborators/${id}`, payload)
      } else {
        await api.post('/collaborators', payload)
      }
      navigate('/collaborators')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            {isEdit ? 'Edit Freelancer' : 'New Freelancer'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="User ID" type="number" value={userId} onChange={(e) => setUserId(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Bio" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} margin="normal" />
            <TextField fullWidth label="Hourly Rate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} margin="normal" helperText="e.g. JavaScript, React, Node.js" />
            <TextField fullWidth select label="Experience Level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} margin="normal" required>
              <MenuItem value="junior">Junior</MenuItem>
              <MenuItem value="mid">Mid</MenuItem>
              <MenuItem value="senior">Senior</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
            </TextField>
            <TextField fullWidth select label="Availability" value={availability} onChange={(e) => setAvailability(e.target.value)} margin="normal" required>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="busy">Busy</MenuItem>
              <MenuItem value="unavailable">Unavailable</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Update' : 'Create')}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/collaborators')}>Cancel</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
