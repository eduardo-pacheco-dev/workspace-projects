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

interface JobModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function JobModal({ open, editId, onClose, onSaved }: JobModalProps) {
  const isEdit = Boolean(editId)

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
    if (open && editId) {
      api.get(`/jobs/${editId}`)
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
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

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
      clientId,
    }

    try {
      if (isEdit) {
        await api.patch(`/jobs/${editId}`, payload)
      } else {
        await api.post('/jobs', payload)
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
    setTitle('')
    setDescription('')
    setBudget('')
    setBudgetType('hourly')
    setSkills('')
    setExperienceLevel('junior')
    setStatus('open')
    setClientId('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Job' : 'Novo Job'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Título" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Descrição" multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" />
          <TextField fullWidth label="Orçamento" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} margin="normal" required />
          <TextField fullWidth select label="Tipo de Orçamento" value={budgetType} onChange={(e) => setBudgetType(e.target.value)} margin="normal" required>
            <MenuItem value="hourly">Por Hora</MenuItem>
            <MenuItem value="fixed">Fixo</MenuItem>
          </TextField>
          <TextField fullWidth label="Habilidades (separadas por vírgula)" value={skills} onChange={(e) => setSkills(e.target.value)} margin="normal" helperText="ex: JavaScript, React, Node.js" />
          <TextField fullWidth select label="Nível de Experiência" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} margin="normal" required>
            <MenuItem value="junior">Junior</MenuItem>
            <MenuItem value="mid">Pleno</MenuItem>
            <MenuItem value="senior">Senior</MenuItem>
            <MenuItem value="lead">Lead</MenuItem>
          </TextField>
          <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} margin="normal" required>
            <MenuItem value="open">Aberto</MenuItem>
            <MenuItem value="in_progress">Em Andamento</MenuItem>
            <MenuItem value="completed">Concluído</MenuItem>
            <MenuItem value="cancelled">Cancelado</MenuItem>
          </TextField>
          <TextField fullWidth label="Cliente" value={clientId} onChange={(e) => setClientId(e.target.value)} margin="normal" required />
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
