import { useState, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import api from '../../services/api'

interface FreelancerModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function FreelancerModal({ open, editId, onClose, onSaved }: FreelancerModalProps) {
  const isEdit = Boolean(editId)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [skills, setSkills] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('junior')
  const [availability, setAvailability] = useState('available')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      api.get(`/freelancers/${editId}`)
        .then((res) => {
          const data = res.data
          setFirstName(data.firstName || '')
          setLastName(data.lastName || '')
          setBio(data.bio || '')
          setHourlyRate(data.hourlyRate ? String(data.hourlyRate) : '')
          setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '')
          setExperienceLevel(data.experienceLevel || 'junior')
          setAvailability(data.availability || 'available')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      firstName,
      lastName,
      bio,
      hourlyRate: Number(hourlyRate),
      skills,
      experienceLevel,
      availability,
    }

    try {
      if (isEdit) {
        await api.patch(`/freelancers/${editId}`, payload)
      } else {
        await api.post('/freelancers', payload)
      }
      onSaved()
      handleClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setFirstName('')
    setLastName('')
    setBio('')
    setHourlyRate('')
    setSkills('')
    setExperienceLevel('junior')
    setAvailability('available')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Freelancer' : 'Novo Freelancer'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Bio" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} margin="normal" />
          <TextField fullWidth label="Valor por Hora" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Habilidades (separadas por vírgula)" value={skills} onChange={(e) => setSkills(e.target.value)} margin="normal" helperText="ex: JavaScript, React, Node.js" />
          <TextField fullWidth select label="Nível de Experiência" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} margin="normal" required>
            <MenuItem value="junior">Junior</MenuItem>
            <MenuItem value="mid">Pleno</MenuItem>
            <MenuItem value="senior">Senior</MenuItem>
            <MenuItem value="lead">Lead</MenuItem>
          </TextField>
          <TextField fullWidth select label="Disponibilidade" value={availability} onChange={(e) => setAvailability(e.target.value)} margin="normal" required>
            <MenuItem value="available">Disponível</MenuItem>
            <MenuItem value="busy">Ocupado</MenuItem>
            <MenuItem value="unavailable">Indisponível</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
