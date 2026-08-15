import { TextField } from '@mui/material'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  minWidth?: number
}

export default function SearchField({ value, onChange, minWidth }: SearchFieldProps) {
  return (
    <TextField
      size="small"
      label="Buscar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={minWidth ? { minWidth } : undefined}
    />
  )
}
