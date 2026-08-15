import { Box, Button, Paper, Typography } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import { RadioLink } from '../../pages/radio-links/radioLinksTypes'
import RadioLinkDetailMap from './RadioLinkDetailMap'

interface RadioLinkMapPanelProps {
  radioLink: RadioLink
}

const shareEndpoint = async (radioLink: RadioLink, lat: number, lng: number, label: string) => {
  const text = `Estação ${label} do enlace ${radioLink.nome}`
  const url = `https://maps.google.com/maps?q=${lat},${lng}`
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
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Mapa do Enlace</Typography>
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
