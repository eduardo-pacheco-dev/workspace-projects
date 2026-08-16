import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Autocomplete, Box, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../services/api'
import { normalizeList } from '../../utils/list'
import Button from '../ui/Button'
import DeleteModal from '../modals/DeleteModal'
import { ProjectRadioLink } from '../../pages/projects/projectsTypes'

interface ProjectRadioLinksTabProps {
  projectId: number
  onError: (message: string) => void
}

export default function ProjectRadioLinksTab({ projectId, onError }: ProjectRadioLinksTabProps) {
  const navigate = useNavigate()
  const [projectRadioLinks, setProjectRadioLinks] = useState<ProjectRadioLink[]>([])
  const [allRadioLinks, setAllRadioLinks] = useState<ProjectRadioLink[]>([])
  const [selectedRadioLink, setSelectedRadioLink] = useState<ProjectRadioLink | null>(null)
  const [toRemove, setToRemove] = useState<ProjectRadioLink | null>(null)

  const fetchProjectRadioLinks = useCallback(() => {
    api.get(`/projects/${projectId}/radio-links`)
      .then((res) => setProjectRadioLinks(res.data))
      .catch(() => {})
  }, [projectId])

  useEffect(() => {
    fetchProjectRadioLinks()
  }, [fetchProjectRadioLinks])

  useEffect(() => {
    api.get('/radio-links', { params: { limit: 1000, sortBy: 'nome', sortOrder: 'ASC' } })
      .then((res) => setAllRadioLinks(normalizeList<ProjectRadioLink>(res.data).data))
      .catch(() => {})
  }, [])

  const handleAdd = async () => {
    if (!selectedRadioLink) return
    try {
      await api.post(`/projects/${projectId}/radio-links`, { radioLinkId: selectedRadioLink.id })
      setSelectedRadioLink(null)
      fetchProjectRadioLinks()
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível adicionar o enlace.')
    }
  }

  const handleRemove = async (radioLinkId: number) => {
    try {
      await api.delete(`/projects/${projectId}/radio-links/${radioLinkId}`)
      fetchProjectRadioLinks()
      setToRemove(null)
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível remover o enlace.')
      setToRemove(null)
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)', mb: 2 }}>Enlaces de Rádio do Projeto</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'flex-start' }}>
        <Autocomplete
          fullWidth
          options={allRadioLinks.filter((rl) => !projectRadioLinks.some((pr) => pr.id === rl.id))}
          getOptionLabel={(rl) => `${rl.nome}${rl.frequencia ? ` · ${rl.frequencia}` : ''}`}
          value={selectedRadioLink}
          onChange={(_, v) => setSelectedRadioLink(v)}
          renderInput={(params) => (
            <TextField {...params} label="Adicionar enlace" placeholder="Busque pelo nome" size="small" />
          )}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={!selectedRadioLink}
          sx={{ height: 40, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Adicionar
        </Button>
      </Box>
      {projectRadioLinks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum enlace de rádio cadastrado neste projeto.</Typography>
      ) : (
        <List dense disablePadding>
          {projectRadioLinks.map((link) => (
            <ListItem
              key={link.id}
              sx={{ px: 0, cursor: 'pointer' }}
              onClick={() => navigate(`/radio-links/${link.id}`)}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>
                <SettingsInputAntennaIcon color="secondary" />
              </ListItemIcon>
              <ListItemText
                primary={link.nome}
                secondary={`${link.siteIdA || '-'} ↔ ${link.siteIdB || '-'}${link.frequencia ? ` · ${link.frequencia}` : ''}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation()
                    setToRemove(link)
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <DeleteModal
        open={Boolean(toRemove)}
        title="Remover enlace"
        message={`Tem certeza que deseja remover o enlace "${toRemove?.nome}" do projeto? Esta ação não poderá ser desfeita.`}
        confirmLabel="Remover"
        onClose={() => setToRemove(null)}
        onConfirm={() => toRemove && handleRemove(toRemove.id)}
      />
    </Paper>
  )
}
