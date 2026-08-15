import { useEffect, useState } from 'react'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import api from '../../services/api'
import StationMap from '../../components/stations/StationMap'
import { Station } from './stationsTypes'

interface StationsMapTabProps {
  search?: string
  status?: string
  mobileCarrier?: string
}

export default function StationsMapTab({ search = '', status = '', mobileCarrier = '' }: StationsMapTabProps) {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params: Record<string, unknown> = { page: 1, limit: 100000 }
    if (search) params.search = search
    if (status) params.status = status
    if (mobileCarrier) params.mobileCarrier = mobileCarrier
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
  }, [search, status, mobileCarrier])

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
          <StationMap stations={stations} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Exibindo {withCoordsCount} de {stations.length} estação(ões) com coordenadas.
          </Typography>
        </>
      )}
    </Box>
  )
}
