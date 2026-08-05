import { useEffect, useRef, useState } from 'react'
import { Box, Alert, CircularProgress, Typography } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../../services/api'

interface StationMapItem {
  id: number
  siteId: string
  endId: string
  latitude: number | null
  longitude: number | null
  endereco: string | null
  status: string
  operadora: string | null
}

interface StationsMapTabProps {
  search?: string
  status?: string
  operadora?: string
}

export default function StationsMapTab({ search = '', status = '', operadora = '' }: StationsMapTabProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [stations, setStations] = useState<StationMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params: Record<string, unknown> = { page: 1, limit: 100000 }
    if (search) params.search = search
    if (status) params.status = status
    if (operadora) params.operadora = operadora
    api
      .get('/stations', { params })
      .then((res) => {
        if (cancelled) return
        setStations(Array.isArray(res.data) ? res.data : res.data.data ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Não foi possível carregar as estações.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, status, operadora])

  useEffect(() => {
    if (!mapRef.current || loading) return

    const map = L.map(mapRef.current)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const withCoords = stations.filter((s) => s.latitude != null && s.longitude != null)
    const points: [number, number][] = []
    withCoords.forEach((s) => {
      const lat = Number(s.latitude)
      const lng = Number(s.longitude)
      points.push([lat, lng])
      const inativo = s.status === 'inativo'
      const endIdLine = s.operadora === 'TIM' ? `<br/>End ID: ${s.endId}` : ''
      L.circleMarker([lat, lng], {
        radius: 8,
        color: inativo ? '#9e9e9e' : '#1565c0',
        fillColor: inativo ? '#9e9e9e' : '#1565c0',
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindPopup(
          `<b>${s.siteId}</b>${endIdLine}<br/>Operadora: ${s.operadora || '-'}<br/>Status: ${inativo ? 'Inativo' : 'Ativo'}`,
        )
    })

    if (points.length === 0) {
      map.setView([-15.7942, -47.8822], 4)
    } else if (points.length === 1) {
      map.setView(points[0], 12)
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [30, 30] })
    }

    return () => {
      map.remove()
    }
  }, [stations, loading])

  const withCoordsCount = stations.filter((s) => s.latitude != null && s.longitude != null).length

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            ref={mapRef}
            sx={{
              width: '100%',
              height: 520,
              borderRadius: 1,
              overflow: 'hidden',
              zIndex: 0,
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Exibindo {withCoordsCount} de {stations.length} estação(ões) com coordenadas.
          </Typography>
        </>
      )}
    </Box>
  )
}
