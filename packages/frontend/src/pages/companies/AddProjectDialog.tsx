import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import api from '../../services/api'
import { ProjectSummary } from './companiesTypes'

interface AddProjectDialogProps {
  open: boolean
  linkedIds: number[]
  onClose: () => void
  onLink: (projectId: number) => void
}

export default function AddProjectDialog({ open, linkedIds, onClose, onLink }: AddProjectDialogProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchProjects = useCallback(() => {
    setError('')
    setLoading(true)
    const params: any = { limit: 100, sortBy: 'nome', sortOrder: 'ASC' }
    if (search) params.search = search
    api.get('/projects', { params })
      .then((res) => {
        const d = res.data
        setProjects(Array.isArray(d) ? d : d.data ?? [])
      })
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os projetos.'))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => {
    if (open) fetchProjects()
  }, [open, fetchProjects])

  const available = projects.filter((p) => !linkedIds.includes(p.id))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular Projeto</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : available.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Nenhum projeto disponível.</Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {available.map((p) => (
              <ListItem key={p.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={p.nome}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <span>{p.codigo || '-'}</span>
                      <span>· {p.cliente || 'Sem cliente'}</span>
                      <Chip
                        size="small"
                        label={p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        color={p.status === 'ativo' ? 'success' : 'default'}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" color="primary" onClick={() => onLink(p.id)}>
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}
