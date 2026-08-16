import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Autocomplete, Box, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, TextField, Typography } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CellTowerIcon from '@mui/icons-material/CellTower'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../services/api'
import { normalizeList } from '../../utils/list'
import Button from '../ui/Button'
import DeleteModal from '../modals/DeleteModal'
import { ProjectStation } from '../../pages/projects/projectsTypes'

interface ProjectStationsTabProps {
  projectId: number
  onError: (message: string) => void
}

export default function ProjectStationsTab({ projectId, onError }: ProjectStationsTabProps) {
  const navigate = useNavigate()
  const [projectStations, setProjectStations] = useState<ProjectStation[]>([])
  const [allStations, setAllStations] = useState<ProjectStation[]>([])
  const [selectedStation, setSelectedStation] = useState<ProjectStation | null>(null)
  const [toRemove, setToRemove] = useState<ProjectStation | null>(null)

  const fetchProjectStations = useCallback(() => {
    api.get(`/projects/${projectId}/stations`)
      .then((res) => setProjectStations(res.data))
      .catch(() => {})
  }, [projectId])

  useEffect(() => {
    fetchProjectStations()
  }, [fetchProjectStations])

  useEffect(() => {
    api.get('/stations', { params: { limit: 1000, sortBy: 'siteId', sortOrder: 'ASC' } })
      .then((res) => setAllStations(normalizeList<ProjectStation>(res.data).data))
      .catch(() => {})
  }, [])

  const handleAdd = async () => {
    if (!selectedStation) return
    try {
      await api.post(`/projects/${projectId}/stations`, { stationId: selectedStation.id })
      setSelectedStation(null)
      fetchProjectStations()
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível adicionar a estação.')
    }
  }

  const handleRemove = async (stationId: number) => {
    try {
      await api.delete(`/projects/${projectId}/stations/${stationId}`)
      fetchProjectStations()
      setToRemove(null)
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível remover a estação.')
      setToRemove(null)
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)', mb: 2 }}>Estações do Projeto</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'flex-start' }}>
        <Autocomplete
          fullWidth
          options={allStations.filter((s) => !projectStations.some((ps) => ps.id === s.id))}
          getOptionLabel={(s) => `${s.siteId} · ${s.endId}${s.mobileCarrier ? ` (${s.mobileCarrier})` : ''}`}
          value={selectedStation}
          onChange={(_, v) => setSelectedStation(v)}
          renderInput={(params) => (
            <TextField {...params} label="Adicionar estação" placeholder="Busque pelo site id ou end id" size="small" />
          )}
        />
        <Button
          variant="contained"
          startIcon={<AttachFileIcon />}
          onClick={handleAdd}
          disabled={!selectedStation}
          sx={{ height: 40, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Adicionar
        </Button>
      </Box>
      {projectStations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhuma estação cadastrada neste projeto.</Typography>
      ) : (
        <List dense disablePadding>
          {projectStations.map((station) => (
            <ListItem
              key={station.id}
              sx={{ px: 0, cursor: 'pointer' }}
              onClick={() => navigate(`/stations/${station.id}`)}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>
                <CellTowerIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={`${station.siteId} · ${station.endId}`}
                secondary={`${station.mobileCarrier || 'Sem operadora'}${station.address ? ` · ${station.address}` : ''}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation()
                    setToRemove(station)
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
        title="Remover estação"
        message={`Tem certeza que deseja remover a estação "${toRemove?.siteId}" do projeto? Esta ação não poderá ser desfeita.`}
        confirmLabel="Remover"
        onClose={() => setToRemove(null)}
        onConfirm={() => toRemove && handleRemove(toRemove.id)}
      />
    </Paper>
  )
}
