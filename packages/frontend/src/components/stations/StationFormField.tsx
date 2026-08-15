import { MenuItem, TextField } from '@mui/material'
import { StationFieldConfig } from '../../pages/stations/stationFormConfig'

interface StationFormFieldProps {
  config: StationFieldConfig
  value: string
  onChange: (value: string) => void
}

export default function StationFormField({ config, value, onChange }: StationFormFieldProps) {
  return (
    <TextField
      fullWidth
      label={config.label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      margin="normal"
      required={config.required}
      type={config.type ?? 'text'}
      multiline={config.multiline}
      rows={config.rows}
      select={Boolean(config.select)}
    >
      {config.select?.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  )
}
