import { TextField } from '@mui/material'

interface DateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  fullWidth?: boolean
}

export default function DateField({ label, value, onChange, disabled, fullWidth = true }: DateFieldProps) {
  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      InputLabelProps={{ shrink: true }}
    />
  )
}
