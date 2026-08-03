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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import api from '../../services/api'
import { FreelancerSummary } from './companiesTypes'

interface AddFreelancerDialogProps {
  open: boolean
  linkedIds: number[]
  onClose: () => void
  onLink: (freelancerId: number) => void
}

export default function AddFreelancerDialog({ open, linkedIds, onClose, onLink }: AddFreelancerDialogProps) {
  const [freelancers, setFreelancers] = useState<FreelancerSummary[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchFreelancers = useCallback(() => {
    setError('')
    setLoading(true)
    const params: any = { limit: 100, sortBy: 'firstName', sortOrder: 'ASC', isFreelancer: true }
    if (search) params.search = search
    api.get('/collaborators', { params })
      .then((res) => {
        setFreelancers(Array.isArray(res.data) ? res.data : res.data.data ?? [])
      })
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os freelancers.'))
      .finally(() => setLoading(false))
  }, [search])

  useEffect(() => {
    if (open) fetchFreelancers()
  }, [open, fetchFreelancers])

  const available = freelancers.filter((f) => !linkedIds.includes(f.id))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular Freelancer</DialogTitle>
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
            <Typography color="text.secondary">Nenhum freelancer disponível.</Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {available.map((f) => (
              <ListItem key={f.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={`${f.firstName} ${f.lastName}`}
                  secondary={f.email || f.status || '-'}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" color="primary" onClick={() => onLink(f.id)}>
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
