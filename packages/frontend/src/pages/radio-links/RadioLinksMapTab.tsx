import { useEffect, useRef, useState } from 'react'
import { Box, Alert, CircularProgress, Typography } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../../services/api'

interface RadioLinkMapItem {
  id: number
  nome: string
  siteIdA: string | null
  siteIdB: string | null
  latitudeA: number | null
  longitudeA: number | null
  latitudeB: number | null
  longitudeB: number | null
  operadoraA: string | null
  operadoraB: string | null
  status: string
}

interface RadioLinksMapTabProps {
  search?: string
  status?: string
  operadora?: string
}

export default function RadioLinksMapTab({ search = '', status = '', operadora = '' }: RadioLinksMapTabProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [radioLinks, setRadioLinks] = useState<RadioLinkMapItem[]>([])
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
      .get('/radio-links', { params })
      .then((res) => {
        if (cancelled) return
        setRadioLinks(Array.isArray(res.data) ? res.data : res.data.data ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Não foi possível carregar os enlaces.')
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

    const points: [number, number][] = []
    radioLinks.forEach((rl) => {
      const latA = rl.latitudeA != null ? Number(rl.latitudeA) : null
      const lngA = rl.longitudeA != null ? Number(rl.longitudeA) : null
      const latB = rl.latitudeB != null ? Number(rl.latitudeB) : null
      const lngB = rl.longitudeB != null ? Number(rl.longitudeB) : null

      if (latA != null && lngA != null) {
        points.push([latA, lngA])
        const inativo = rl.status === 'inativo'
        L.circleMarker([latA, lngA], {
          radius: 7,
          color: inativo ? '#9e9e9e' : '#1565c0',
          fillColor: inativo ? '#9e9e9e' : '#1565c0',
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(`<b>${rl.siteIdA || 'Estação A'}</b><br/>Enlace: ${rl.nome}`)
      }

      if (latB != null && lngB != null) {
        points.push([latB, lngB])
        const inativo = rl.status === 'inativo'
        L.circleMarker([latB, lngB], {
          radius: 7,
          color: inativo ? '#9e9e9e' : '#c62828',
          fillColor: inativo ? '#9e9e9e' : '#c62828',
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(`<b>${rl.siteIdB || 'Estação B'}</b><br/>Enlace: ${rl.nome}`)
      }

      if (
        latA != null && lngA != null &&
        latB != null && lngB != null
      ) {
        const inativo = rl.status === 'inativo'
        L.polyline(
          [
            [latA, lngA],
            [latB, lngB],
          ],
          { color: inativo ? '#9e9e9e' : '#6a1b9a', weight: 3, dashArray: '6 6' },
        )
          .addTo(map)
          .bindPopup(`<b>${rl.nome}</b><br/>${rl.siteIdA || '-'} ⇄ ${rl.siteIdB || '-'}`)
      }
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
  }, [radioLinks, loading])

  const withCoordsCount = radioLinks.filter(
    (rl) =>
      (rl.latitudeA != null && rl.longitudeA != null) ||
      (rl.latitudeB != null && rl.longitudeB != null),
  ).length

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
            Exibindo {withCoordsCount} de {radioLinks.length} enlace(s) com coordenadas.
          </Typography>
        </>
      )}
    </Box>
  )
}
