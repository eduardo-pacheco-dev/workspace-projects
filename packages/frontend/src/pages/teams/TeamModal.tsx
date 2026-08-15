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
import { CollaboratorOption } from './teamsTypes'
import MemberPicker from '../../components/teams/MemberPicker'

interface TeamModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

export default function TeamModal({ open, editId, onClose, onSaved }: TeamModalProps) {
  const isEdit = Boolean(editId)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState('ativo')
  const [collaborators, setCollaborators] = useState<CollaboratorOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [currentIds, setCurrentIds] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    resetForm()

    api
      .get('/collaborators', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => {
        const d = res.data
        setCollaborators(Array.isArray(d) ? d : d.data ?? [])
      })
      .catch(() => {})

    if (editId) {
      api
        .get(`/teams/${editId}`)
        .then((res) => {
          const team = res.data
          setNome(team.nome || '')
          setDescricao(team.descricao || '')
          setStatus(team.status || 'ativo')
          const ids = (team.members ?? []).map((m: any) => m.collaboratorId)
          setSelectedIds(ids)
          setCurrentIds(ids)
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

  const resetForm = () => {
    setNome('')
    setDescricao('')
    setStatus('ativo')
    setSelectedIds([])
    setCurrentIds([])
    setError('')
  }

  const toggleMember = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const syncMembers = async (teamId: number) => {
    if (isEdit) {
      const current = new Set(currentIds)
      const target = new Set(selectedIds)
      for (const cid of currentIds) {
        if (!target.has(cid)) await api.delete(`/teams/${teamId}/members/${cid}`)
      }
      for (const cid of selectedIds) {
        if (!current.has(cid)) await api.post(`/teams/${teamId}/members`, { collaboratorId: cid })
      }
    } else {
      for (const cid of selectedIds) {
        await api.post(`/teams/${teamId}/members`, { collaboratorId: cid })
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: any = { nome, status }
      if (descricao) payload.descricao = descricao

      let teamId = editId
      if (isEdit) {
        await api.patch(`/teams/${teamId}`, payload)
      } else {
        const res = await api.post('/teams', payload)
        teamId = res.data.id
      }
      if (teamId == null) throw new Error('Falha ao identificar a equipe')

      await syncMembers(teamId)
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
    resetForm()
    setCollaborators([])
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Equipe' : 'Nova Equipe'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Nome da Equipe"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Descrição"
            multiline
            rows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            margin="normal"
            required
          >
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
          </TextField>

          <MemberPicker collaborators={collaborators} selectedIds={selectedIds} onToggle={toggleMember} />
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
