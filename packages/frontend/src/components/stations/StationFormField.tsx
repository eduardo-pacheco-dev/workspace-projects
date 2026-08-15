import { StationFieldConfig } from '../../pages/stations/stationFormConfig'
import TextField from '../ui/TextField'
import SelectField from '../ui/SelectField'

interface StationFormFieldProps {
  config: StationFieldConfig
  value: string
  onChange: (value: string) => void
}

export default function StationFormField({ config, value, onChange }: StationFormFieldProps) {
  if (config.select) {
    return (
      <SelectField
        label={config.label}
        value={value}
        onChange={onChange}
        margin="normal"
        options={config.select.map((option) => ({ value: option, label: option }))}
        required={config.required}
      />
    )
  }

  return (
    <TextField
      label={config.label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      margin="normal"
      required={config.required}
      type={config.type ?? 'text'}
      multiline={config.multiline}
      rows={config.rows}
    />
  )
}
