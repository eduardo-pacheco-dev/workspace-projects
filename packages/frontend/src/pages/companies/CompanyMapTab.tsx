import { useState, useEffect, useRef } from 'react'
import { Paper, Typography, Box, CircularProgress, Alert, Button } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Company } from './companiesTypes'

interface CompanyMapTabProps {
  company: Company
}

export default function CompanyMapTab({ company }: CompanyMapTabProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const address = [company.endereco, company.cidade, company.uf].filter(Boolean).join(', ')

  useEffect(() => {
    if (!address) {
      setError('Endereço não informado para exibir no mapa.')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')
    setCoords(null)

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
    )
      .then((res) => res.json())
      .then((results) => {
        if (cancelled) return
        if (!Array.isArray(results) || results.length === 0) {
          setError('Não foi possível localizar o endereço no mapa.')
          return
        }
        setCoords({ lat: Number(results[0].lat), lng: Number(results[0].lon) })
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível geocodificar o endereço.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [address])

  useEffect(() => {
    if (!coords || !mapRef.current) return

    const map = L.map(mapRef.current)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    L.marker([coords.lat, coords.lng])
      .addTo(map)
      .bindPopup(company.nome)
      .openPopup()

    map.setView([coords.lat, coords.lng], 15)

    return () => {
      map.remove()
    }
  }, [coords, company.nome])

  const mapsUrl = coords
    ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=17/${coords.lat}/${coords.lng}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(address || company.nome)}`

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>Localização</Typography>
          <Typography variant="body2" color="text.secondary">
            {address || company.nome}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<OpenInNewIcon />}
          component="a"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir no mapa
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="info" sx={{ mb: 2 }}>{error}</Alert>}

      {coords && (
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
      )}
    </Paper>
  )
}
