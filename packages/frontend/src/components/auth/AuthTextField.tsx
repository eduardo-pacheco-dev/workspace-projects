import { InputAdornment, TextField } from '@mui/material'

interface AuthTextFieldProps {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  error?: string
  required?: boolean
  placeholder?: string
  maxLength?: number
}

export default function AuthTextField({
  icon,
  label,
  value,
  onChange,
  type,
  error,
  required,
  placeholder,
  maxLength,
}: AuthTextFieldProps) {
  return (
    <TextField
      fullWidth
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      margin="normal"
      required={required}
      error={Boolean(error)}
      helperText={error}
      placeholder={placeholder}
      inputProps={maxLength ? { maxLength } : undefined}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {icon}
          </InputAdornment>
        ),
      }}
    />
  )
}
