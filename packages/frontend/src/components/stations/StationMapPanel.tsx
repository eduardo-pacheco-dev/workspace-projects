import { Box, Button, Paper, Typography } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import { Station } from '../../pages/stations/stationsTypes'

interface StationMapPanelProps {
  station: Station
}

const stationUrl = (station: Station) =>
  `https://www.openstreetmap.org/?mlat=${station.latitude}&mlon=${station.longitude}#map=17/${station.latitude}/${station.longitude}`

const stationEmbedUrl = (station: Station) => {
  const delta = 0.008
  const bbox = `${station.longitude! - delta},${station.latitude! - delta},${station.longitude! + delta},${station.latitude! + delta}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${station.latitude},${station.longitude}`
}

export default function StationMapPanel({ station }: StationMapPanelProps) {
  const hasCoords = station.latitude != null && station.longitude != null

  const handleShare = async () => {
    const text = `Estação ${station.siteId} (${station.mobileCarrier || 'sem operadora'})`
    const url = stationUrl(station)
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

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>Localização no Mapa</Typography>
        {hasCoords && (
          <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>
            Compartilhar Localização
          </Button>
        )}
      </Box>
      {hasCoords ? (
        <Box
          component="iframe"
          title={`Mapa da estação ${station.siteId}`}
          src={stationEmbedUrl(station)}
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
  )
}
