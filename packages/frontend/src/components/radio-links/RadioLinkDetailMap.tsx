import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { RadioLink } from '../../pages/radio-links/radioLinksTypes'

interface RadioLinkDetailMapProps {
  radioLink: RadioLink
}

const distanceLabelStyle = `
.radio-link-distance-icon {
  width: 220px !important;
  height: 40px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
}
.radio-link-distance {
  background-color: #6a1b9a;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 2px 10px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  transform-origin: center;
}
`

const toRad = (deg: number) => (deg * Math.PI) / 180
const toDeg = (rad: number) => (rad * 180) / Math.PI

function bearingBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaLng = toRad(lng2 - lng1)
  const y = Math.sin(deltaLng) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export default function RadioLinkDetailMap({ radioLink }: RadioLinkDetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return
    const { latitudeA: latA, longitudeA: lngA, latitudeB: latB, longitudeB: lngB } = radioLink
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

    L.polyline(points, { color: '#6a1b9a', weight: 3, dashArray: '6 6' }).addTo(map)

    const bearing = bearingBetween(latA, lngA, latB, lngB)
    const rotation = bearing - 90

    const midpoint = L.latLng((latA + latB) / 2, (lngA + lngB) / 2)
    const icon = L.divIcon({
      className: 'radio-link-distance-icon',
      html: `<span class="radio-link-distance" style="transform: rotate(${rotation}deg)">${distanceLabel}</span>`,
      iconSize: [220, 40],
      iconAnchor: [110, 20],
    })
    L.marker(midpoint, { icon, interactive: false }).addTo(map)

    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })

    return () => {
      map.remove()
    }
  }, [radioLink])

  return (
    <>
      <style>{distanceLabelStyle}</style>
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
    </>
  )
}
