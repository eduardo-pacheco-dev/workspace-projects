import { Box, Button, Paper, Typography } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import { RadioLink } from '../../pages/radio-links/radioLinksTypes'
import RadioLinkDetailMap from './RadioLinkDetailMap'

interface RadioLinkMapPanelProps {
  radioLink: RadioLink
}

const shareEndpoint = async (radioLink: RadioLink, lat: number, lng: number, label: string) => {
  const text = `Estação ${label} do enlace ${radioLink.nome}`
  const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`
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

export default function RadioLinkMapPanel({ radioLink }: RadioLinkMapPanelProps) {
  const hasBothCoords =
    radioLink.latitudeA != null &&
    radioLink.longitudeA != null &&
    radioLink.latitudeB != null &&
    radioLink.longitudeB != null

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>Mapa do Enlace</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {radioLink.latitudeA != null && radioLink.longitudeA != null && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              onClick={() => shareEndpoint(radioLink, radioLink.latitudeA!, radioLink.longitudeA!, 'A')}
            >
              Compartilhar A
            </Button>
          )}
          {radioLink.latitudeB != null && radioLink.longitudeB != null && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              onClick={() => shareEndpoint(radioLink, radioLink.latitudeB!, radioLink.longitudeB!, 'B')}
            >
              Compartilhar B
            </Button>
          )}
        </Box>
      </Box>
      {hasBothCoords ? (
        <RadioLinkDetailMap radioLink={radioLink} />
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          As duas pontas precisam de coordenadas para exibir o mapa do enlace.
        </Typography>
      )}
    </Paper>
  )
}
