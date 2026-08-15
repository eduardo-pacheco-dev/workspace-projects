import { useState } from 'react'
import { Autocomplete, FormControlLabel, Switch, TextField } from '@mui/material'
import { RadioLinkOption, StationOption } from '../../pages/service-orders/serviceOrdersTypes'

type TargetType = 'estacao' | 'enlace'

interface ServiceTargetPickerProps {
  stations: StationOption[]
  radioLinks: RadioLinkOption[]
  selectedStation: StationOption | null
  selectedRadioLink: RadioLinkOption | null
  onSelectStation: (station: StationOption | null) => void
  onSelectRadioLink: (link: RadioLinkOption | null) => void
  error?: string
}

export default function ServiceTargetPicker({
  stations,
  radioLinks,
  selectedStation,
  selectedRadioLink,
  onSelectStation,
  onSelectRadioLink,
  error,
}: ServiceTargetPickerProps) {
  const [targetType, setTargetType] = useState<TargetType>('estacao')

  const switchTarget = (next: TargetType) => {
    setTargetType(next)
    onSelectStation(null)
    onSelectRadioLink(null)
  }

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={targetType === 'enlace'}
            onChange={(e) => switchTarget(e.target.checked ? 'enlace' : 'estacao')}
          />
        }
        label={targetType === 'estacao' ? 'Estação' : 'Enlace de Rádio'}
        sx={{ mt: 1 }}
      />
      {targetType === 'estacao' ? (
        <Autocomplete
          fullWidth
          options={stations}
          getOptionLabel={(s) => `${s.siteId} - ${s.address || s.endId}`}
          value={selectedStation}
          onChange={(_, v) => onSelectStation(v)}
          isOptionEqualToValue={(option, selected) => option.id === selected.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Estação"
              margin="normal"
              placeholder="Busque pelo site id ou endereço"
              error={Boolean(error)}
              helperText={error}
            />
          )}
        />
      ) : (
        <Autocomplete
          fullWidth
          options={radioLinks}
          getOptionLabel={(r) => r.nome}
          value={selectedRadioLink}
          onChange={(_, v) => onSelectRadioLink(v)}
          isOptionEqualToValue={(option, selected) => option.id === selected.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enlace de Rádio"
              margin="normal"
              placeholder="Busque pelo nome do enlace"
              error={Boolean(error)}
              helperText={error}
            />
          )}
        />
      )}
    </>
  )
}
