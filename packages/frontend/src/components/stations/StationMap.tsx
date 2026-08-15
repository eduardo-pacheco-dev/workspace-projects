import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Station } from '../../pages/stations/stationsTypes'

interface StationMapProps {
  stations: Station[]
}

export default function StationMap({ stations }: StationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

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
      const endIdLine = s.mobileCarrier === 'TIM' ? `<br/>End ID: ${s.endId}` : ''
      L.circleMarker([lat, lng], {
        radius: 8,
        color: inativo ? '#9e9e9e' : '#1565c0',
        fillColor: inativo ? '#9e9e9e' : '#1565c0',
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindPopup(
          `<b>${s.siteId}</b>${endIdLine}<br/>Operadora: ${s.mobileCarrier || '-'}<br/>Status: ${inativo ? 'Inativo' : 'Ativo'}`,
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
  }, [stations])

  return (
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
  )
}
