import { useEffect, useState } from 'react'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import api from '../../services/api'
import RadioLinksMap from '../../components/radio-links/RadioLinksMap'
import { RadioLink } from './radioLinksTypes'

interface RadioLinksMapTabProps {
  search?: string
  status?: string
  operadora?: string
}

export default function RadioLinksMapTab({ search = '', status = '', operadora = '' }: RadioLinksMapTabProps) {
  const [radioLinks, setRadioLinks] = useState<RadioLink[]>([])
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

  const withCoordsCount = radioLinks.filter(
    (link) =>
      (link.latitudeA != null && link.longitudeA != null) ||
      (link.latitudeB != null && link.longitudeB != null),
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
          <RadioLinksMap radioLinks={radioLinks} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Exibindo {withCoordsCount} de {radioLinks.length} enlace(s) com coordenadas.
          </Typography>
        </>
      )}
    </Box>
  )
}
