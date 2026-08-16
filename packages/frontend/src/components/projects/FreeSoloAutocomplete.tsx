import { Autocomplete, TextField } from '@mui/material'

interface FreeSoloAutocompleteProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function FreeSoloAutocomplete({ label, options, value, onChange, placeholder }: FreeSoloAutocompleteProps) {
  return (
    <Autocomplete
      fullWidth
      freeSolo
      options={options}
      value={value}
      onChange={(_, v) => onChange(v ?? '')}
      onInputChange={(_, v) => onChange(v)}
      renderInput={(params) => (
        <TextField {...params} label={label} margin="normal" placeholder={placeholder} size="small" />
      )}
    />
  )
}
