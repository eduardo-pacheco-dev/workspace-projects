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

export default function JobForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [budgetType, setBudgetType] = useState('hourly')
  const [skills, setSkills] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('junior')
  const [status, setStatus] = useState('open')
  const [clientId, setClientId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/jobs/${id}`)
        .then((res) => {
          const data = res.data
          setTitle(data.title || '')
          setDescription(data.description || '')
          setBudget(data.budget ? String(data.budget) : '')
          setBudgetType(data.budgetType || 'hourly')
          setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '')
          setExperienceLevel(data.experienceLevel || 'junior')
          setStatus(data.status || 'open')
          setClientId(String(data.clientId || ''))
        })
        .catch((err) => setError(err.response?.data?.message || 'Error loading job.'))
    }
  }, [id, isEdit])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      title,
      description,
      budget: Number(budget),
      budgetType,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      experienceLevel,
      status,
      clientId: Number(clientId),
    }

    try {
      if (isEdit) {
        await api.patch(`/jobs/${id}`, payload)
      } else {
        await api.post('/jobs', payload)
      }
      navigate('/jobs')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>{isEdit ? 'Edit Job' : 'New Job'}</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Description" multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" />
            <TextField fullWidth label="Budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} margin="normal" required />
            <TextField fullWidth select label="Budget Type" value={budgetType} onChange={(e) => setBudgetType(e.target.value)} margin="normal" required>
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="fixed">Fixed</MenuItem>
            </TextField>
            <TextField fullWidth label="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} margin="normal" helperText="e.g. JavaScript, React, Node.js" />
            <TextField fullWidth select label="Experience Level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} margin="normal" required>
              <MenuItem value="junior">Junior</MenuItem>
              <MenuItem value="mid">Mid</MenuItem>
              <MenuItem value="senior">Senior</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
            </TextField>
            <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} margin="normal" required>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            <TextField fullWidth label="Client ID" type="number" value={clientId} onChange={(e) => setClientId(e.target.value)} margin="normal" required />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Update' : 'Create')}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/jobs')}>Cancel</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
