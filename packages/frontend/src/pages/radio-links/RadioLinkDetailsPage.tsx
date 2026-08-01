import { useState, useEffect, useCallback, useRef } from 'react'
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
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna'
import ShareIcon from '@mui/icons-material/Share'
import api from '../../services/api'
import { formatDateTime } from '../../utils/format'
import RadioLinkModal from './RadioLinkModal'

interface RadioLink {
  id: number
  nome: string
  frequencia: string | null
  capacidade: string | null
  siteIdA: string | null
  endIdA: string | null
  enderecoA: string | null
  latitudeA: number | null
  longitudeA: number | null
  operadoraA: string | null
  siteIdB: string | null
  endIdB: string | null
  enderecoB: string | null
  latitudeB: number | null
  longitudeB: number | null
  operadoraB: string | null
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

const distanceLabelStyle = `
.radio-link-distance {
  background-color: #6a1b9a;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 2px 10px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
.radio-link-distance::before {
  display: none;
}
`

export default function RadioLinkDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const radioLinkId = Number(id)
  const [radioLink, setRadioLink] = useState<RadioLink | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/radio-links/${radioLinkId}`)
      setRadioLink(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o enlace.')
    }
  }, [radioLinkId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!radioLink || !mapRef.current) return
    const latA = radioLink.latitudeA
    const lngA = radioLink.longitudeA
    const latB = radioLink.latitudeB
    const lngB = radioLink.longitudeB
    if (latA == null || lngA == null || latB == null || lngB == null) return

    const map = L.map(mapRef.current)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const points: [number, number][] = []
    L.circleMarker([latA, lngA], { radius: 8, color: '#1565c0', fillColor: '#1565c0', fillOpacity: 1 })
      .addTo(map)
      .bindPopup(`Estação A: ${radioLink.siteIdA || ''}`)
    points.push([latA, lngA])

    L.circleMarker([latB, lngB], { radius: 8, color: '#c62828', fillColor: '#c62828', fillOpacity: 1 })
      .addTo(map)
      .bindPopup(`Estação B: ${radioLink.siteIdB || ''}`)
    points.push([latB, lngB])

    const distanceM = map.distance([latA, lngA], [latB, lngB])
    const distanceKm = distanceM / 1000
    const distanceLabel = distanceKm >= 100 ? `${distanceKm.toFixed(0)} km` : `${distanceKm.toFixed(1)} km`

    const line = L.polyline(points, { color: '#6a1b9a', weight: 3, dashArray: '6 6' }).addTo(map)
    line.bindTooltip(distanceLabel, {
      permanent: true,
      direction: 'center',
      className: 'radio-link-distance',
    })

    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })

    return () => {
      map.remove()
    }
  }, [radioLink])

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o enlace "${radioLink?.nome}"?`)) return
    try {
      await api.delete(`/radio-links/${radioLinkId}`)
      navigate('/radio-links')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const handleShare = async (lat: number, lng: number, label: string) => {
    const text = `Estação ${label} do enlace ${radioLink?.nome}`
    const url = `https://maps.google.com/maps?q=${lat},${lng}`
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

  const renderEnd = (title: string, end: {
    siteId: string | null
    endId: string | null
    endereco: string | null
    latitude: number | null
    longitude: number | null
    operadora: string | null
  }) => {
    const hasCoords = end.latitude != null && end.longitude != null
    const fields = [
      { label: 'Site ID', value: end.siteId || '-' },
      { label: 'End ID', value: end.endId || '-' },
      { label: 'Endereço', value: end.endereco || '-' },
      {
        label: 'Coordenadas',
        value: hasCoords ? `${end.latitude}, ${end.longitude}` : '-',
      },
    ]

    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          {end.operadora && (
            <Chip size="small" label={end.operadora} color={operadoraColors[end.operadora] || 'default'} />
          )}
        </Box>
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} sm={6} key={field.label}>
              <Typography variant="subtitle2" color="text.secondary">
                {field.label}
              </Typography>
              <Typography variant="body1">{field.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    )
  }

  const hasBothCoords =
    radioLink != null &&
    radioLink.latitudeA != null &&
    radioLink.longitudeA != null &&
    radioLink.latitudeB != null &&
    radioLink.longitudeB != null

  return (
    <Container sx={{ mt: 4 }}>
      <style>{distanceLabelStyle}</style>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/radio-links')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {radioLink && (
        <>
          <Card sx={{ mb: 3, bgcolor: 'rgba(156, 39, 176, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SettingsInputAntennaIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{radioLink.nome}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {radioLink.frequencia || 'Sem frequência'}
                      {radioLink.capacidade ? ` · ${radioLink.capacidade}` : ''}
                    </Typography>
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
                  label={radioLink.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  color={radioLink.status === 'ativo' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Informações do Enlace</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Nome', value: radioLink.nome },
                { label: 'Frequência', value: radioLink.frequencia || '-' },
                { label: 'Capacidade', value: radioLink.capacidade || '-' },
                { label: 'Observações', value: radioLink.observacoes || '-' },
                { label: 'Criado em', value: formatDateTime(radioLink.createdAt) },
                { label: 'Atualizado em', value: formatDateTime(radioLink.updatedAt) },
              ].map((field) => (
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

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              {renderEnd('Estação A', {
                siteId: radioLink.siteIdA,
                endId: radioLink.endIdA,
                endereco: radioLink.enderecoA,
                latitude: radioLink.latitudeA,
                longitude: radioLink.longitudeA,
                operadora: radioLink.operadoraA,
              })}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderEnd('Estação B', {
                siteId: radioLink.siteIdB,
                endId: radioLink.endIdB,
                endereco: radioLink.enderecoB,
                latitude: radioLink.latitudeB,
                longitude: radioLink.longitudeB,
                operadora: radioLink.operadoraB,
              })}
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6">Mapa do Enlace</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {radioLink.latitudeA != null && radioLink.longitudeA != null && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    onClick={() => handleShare(radioLink.latitudeA!, radioLink.longitudeA!, 'A')}
                  >
                    Compartilhar A
                  </Button>
                )}
                {radioLink.latitudeB != null && radioLink.longitudeB != null && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShareIcon />}
                    onClick={() => handleShare(radioLink.latitudeB!, radioLink.longitudeB!, 'B')}
                  >
                    Compartilhar B
                  </Button>
                )}
              </Box>
            </Box>
            {hasBothCoords ? (
              <Box
                ref={mapRef}
                sx={{
                  width: '100%',
                  height: 420,
                  borderRadius: 1,
                  overflow: 'hidden',
                  zIndex: 0,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                As duas pontas precisam de coordenadas para exibir o mapa do enlace.
              </Typography>
            )}
          </Paper>

          <RadioLinkModal
            open={editOpen}
            editId={radioLinkId}
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
