import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { RadioLink } from '../../pages/radio-links/radioLinksTypes'

interface RadioLinksMapProps {
  radioLinks: RadioLink[]
}

export default function RadioLinksMap({ radioLinks }: RadioLinksMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const map = L.map(mapRef.current)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const points: [number, number][] = []
    radioLinks.forEach((link) => {
      const latA = link.latitudeA != null ? Number(link.latitudeA) : null
      const lngA = link.longitudeA != null ? Number(link.longitudeA) : null
      const latB = link.latitudeB != null ? Number(link.latitudeB) : null
      const lngB = link.longitudeB != null ? Number(link.longitudeB) : null
      const inativo = link.status === 'inativo'

      if (latA != null && lngA != null) {
        points.push([latA, lngA])
        L.circleMarker([latA, lngA], {
          radius: 7,
          color: inativo ? '#9e9e9e' : '#1565c0',
          fillColor: inativo ? '#9e9e9e' : '#1565c0',
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(`<b>${link.siteIdA || 'Estação A'}</b><br/>Enlace: ${link.nome}`)
      }

      if (latB != null && lngB != null) {
        points.push([latB, lngB])
        L.circleMarker([latB, lngB], {
          radius: 7,
          color: inativo ? '#9e9e9e' : '#c62828',
          fillColor: inativo ? '#9e9e9e' : '#c62828',
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup(`<b>${link.siteIdB || 'Estação B'}</b><br/>Enlace: ${link.nome}`)
      }

      if (latA != null && lngA != null && latB != null && lngB != null) {
        L.polyline(
          [
            [latA, lngA],
            [latB, lngB],
          ],
          { color: inativo ? '#9e9e9e' : '#6a1b9a', weight: 3, dashArray: '6 6' },
        )
          .addTo(map)
          .bindPopup(`<b>${link.nome}</b><br/>${link.siteIdA || '-'} ⇄ ${link.siteIdB || '-'}`)
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
  }, [radioLinks])

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
