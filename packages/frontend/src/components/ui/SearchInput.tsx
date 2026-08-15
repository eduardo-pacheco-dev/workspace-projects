import { TextField } from '@mui/material'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  minWidth?: number
}

export default function SearchInput({ value, onChange, minWidth }: SearchInputProps) {
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
