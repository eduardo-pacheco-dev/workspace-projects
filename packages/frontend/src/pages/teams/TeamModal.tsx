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
  Checkbox,
  FormControlLabel,
  Chip,
  Typography,
  Stack,
} from '@mui/material'
import api from '../../services/api'

interface CollaboratorOption {
  id: number
  nome: string | null
  firstName?: string | null
  lastName?: string | null
  cargo?: string | null
  isFreelancer: boolean
}

interface TeamModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

const memberName = (c: CollaboratorOption) =>
  c.nome || [c.firstName, c.lastName].filter(Boolean).join(' ')

export default function TeamModal({ open, editId, onClose, onSaved }: TeamModalProps) {
  const isEdit = Boolean(editId)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState('ativo')
  const [collaborators, setCollaborators] = useState<CollaboratorOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [currentIds, setCurrentIds] = useState<number[]>([])
  const [typeFilter, setTypeFilter] = useState<'todos' | 'freelancer' | 'colaborador'>('todos')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setNome('')
    setDescricao('')
    setStatus('ativo')
    setSelectedIds([])
    setCurrentIds([])
    setTypeFilter('todos')
    setSearch('')

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

  const toggleMember = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const filtered = collaborators.filter((c) => {
    const name = memberName(c).toLowerCase()
    if (search && !name.includes(search.toLowerCase())) return false
    if (typeFilter === 'freelancer' && !c.isFreelancer) return false
    if (typeFilter === 'colaborador' && c.isFreelancer) return false
    return true
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: any = { nome, status }
      if (descricao) payload.descricao = descricao

      let teamId = editId
      if (editId) {
        await api.patch(`/teams/${editId}`, payload)
      } else {
        const res = await api.post('/teams', payload)
        teamId = res.data.id
      }
      if (teamId == null) throw new Error('Falha ao identificar a equipe')

      if (editId) {
        const current = new Set(currentIds)
        const target = new Set(selectedIds)
        for (const cid of currentIds) {
          if (!target.has(cid)) await api.delete(`/teams/${editId}/members/${cid}`)
        }
        for (const cid of selectedIds) {
          if (!current.has(cid)) await api.post(`/teams/${editId}/members`, { collaboratorId: cid })
        }
      } else {
        for (const cid of selectedIds) {
          await api.post(`/teams/${teamId}/members`, { collaboratorId: cid })
        }
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
    setNome('')
    setDescricao('')
    setStatus('ativo')
    setSelectedIds([])
    setCurrentIds([])
    setCollaborators([])
    setTypeFilter('todos')
    setSearch('')
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

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Membros ({selectedIds.length})
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                size="small"
                fullWidth
                label="Buscar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <TextField
                size="small"
                select
                label="Tipo"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="freelancer">Freelancers</MenuItem>
                <MenuItem value="colaborador">Colaboradores</MenuItem>
              </TextField>
            </Stack>
            <Box sx={{ maxHeight: 260, overflowY: 'auto', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1, p: 1 }}>
              {filtered.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                  Nenhum colaborador encontrado.
                </Typography>
              ) : (
                filtered.map((c) => (
                  <FormControlLabel
                    key={c.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleMember(c.id)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{memberName(c) || '-'}</span>
                        <Chip
                          size="small"
                          label={c.isFreelancer ? 'Freelancer' : 'Colaborador'}
                          color={c.isFreelancer ? 'primary' : 'default'}
                        />
                      </Box>
                    }
                    sx={{ width: '100%', mx: 0 }}
                  />
                ))
              )}
            </Box>
          </Box>
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
