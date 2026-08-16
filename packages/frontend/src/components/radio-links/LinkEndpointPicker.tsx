import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import Button from '../ui/Button'
import { LinkStationOption } from '../../pages/radio-links/radioLinksTypes'

interface LinkEndpointPickerProps {
  label: string
  stations: LinkStationOption[]
  value: LinkStationOption | null
  onChange: (station: LinkStationOption | null) => void
  onNewStation: () => void
}

const stationLabel = (station: LinkStationOption) =>
  `${station.siteId} · ${station.endId}${station.mobileCarrier ? ` (${station.mobileCarrier})` : ''}`

export default function LinkEndpointPicker({ label, stations, value, onChange, onNewStation }: LinkEndpointPickerProps) {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>{label}</Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Autocomplete
          fullWidth
          options={stations}
          getOptionLabel={stationLabel}
          value={value}
          onChange={(_, v) => onChange(v)}
          renderInput={(params) => (
            <TextField {...params} label="Selecionar estação" placeholder="Busque pelo site id ou end id" />
          )}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onNewStation}
          sx={{ height: 56, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Nova Estação
        </Button>
      </Box>
    </>
  )
}
