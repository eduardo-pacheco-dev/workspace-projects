import { MenuItem, TextField } from '@mui/material'

interface FilterSelectProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  allLabel?: string
  onChange: (value: string) => void
  minWidth?: number
}

export default function FilterSelect({ label, value, options, allLabel = 'Todos', onChange, minWidth = 160 }: FilterSelectProps) {
  return (
    <TextField
      size="small"
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth }}
    >
      <MenuItem value="">{allLabel}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
      ))}
    </TextField>
  )
}
