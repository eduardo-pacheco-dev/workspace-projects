import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Alert,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CellTowerIcon from '@mui/icons-material/CellTower'
import ShareIcon from '@mui/icons-material/Share'
import api from '../../services/api'
import { formatDateTime } from '../../utils/format'
import StationModal from './StationModal'

interface Station {
  id: number
  siteId: string
  endId: string
  endereco: string | null
  latitude: number | null
  longitude: number | null
  operadora: string | null
  observacoes: string | null
  status: string
  createdAt: string
  updatedAt: string
}

const operadoraColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  TIM: 'info',
  CLARO: 'warning',
  VIVO: 'success',
  Outras: 'default',
}

export default function StationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const stationId = Number(id)
  const [station, setStation] = useState<Station | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/stations/${stationId}`)
      setStation(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a estação.')
    }
  }, [stationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a estação "${station?.siteId}"?`)) return
    try {
      await api.delete(`/stations/${stationId}`)
      navigate('/stations')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const handleShare = async () => {
    if (!station) return
    const text = `Estação ${station.siteId} (${station.operadora || 'sem operadora'})`
    const url = `https://maps.google.com/maps?q=${station.latitude},${station.longitude}`
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url })
        return
      } catch (err: any) {
        if (err?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} - ${url}`)
      alert('Link copiado para a área de transferência!')
    } catch {
      alert(`Compartilhe este link: ${url}`)
    }
  }

  const fields = station
    ? [
        { label: 'Site ID', value: station.siteId },
        { label: 'End ID', value: station.endId },
        { label: 'Endereço', value: station.endereco || '-' },
        {
          label: 'Coordenadas',
          value:
            station.latitude != null && station.longitude != null
              ? `${station.latitude}, ${station.longitude}`
              : '-',
        },
        { label: 'Observações', value: station.observacoes || '-' },
        { label: 'Criado em', value: formatDateTime(station.createdAt) },
        { label: 'Atualizado em', value: formatDateTime(station.updatedAt) },
      ]
    : []

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/stations')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {station && (
        <>
          <Card sx={{ mb: 3, bgcolor: 'rgba(21, 101, 192, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CellTowerIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{station.siteId}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={station.operadora || 'Sem operadora'}
                        color={operadoraColors[station.operadora || ''] || 'default'}
                      />
                      <Typography variant="subtitle1" color="text.secondary">
                        · {station.endId}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)} sx={{ mr: 1 }}>
                    Editar
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
                    Excluir
                  </Button>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={station.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={station.status === 'ativo' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Informações da Estação</Typography>
            <Grid container spacing={2}>
              {fields.map((field) => (
                <Grid item xs={12} sm={6} key={field.label}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {field.label}
                  </Typography>
                  <Typography variant="body1">{field.value}</Typography>
                  <Divider sx={{ mt: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">Localização no Mapa</Typography>
              {station.latitude != null && station.longitude != null && (
                <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>
                  Compartilhar Localização
                </Button>
              )}
            </Box>
            {station.latitude != null && station.longitude != null ? (
              <Box
                component="iframe"
                title={`Mapa da estação ${station.siteId}`}
                src={`https://maps.google.com/maps?q=${station.latitude},${station.longitude}&z=16&output=embed`}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: 400,
                  border: 0,
                  borderRadius: 1,
                  display: 'block',
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                Esta estação não possui coordenadas cadastradas.
              </Typography>
            )}
          </Paper>

          <StationModal
            open={editOpen}
            editId={stationId}
            onClose={() => setEditOpen(false)}
            onSaved={() => {
              setEditOpen(false)
              fetchData()
            }}
          />
        </>
      )}
    </Container>
  )
}
