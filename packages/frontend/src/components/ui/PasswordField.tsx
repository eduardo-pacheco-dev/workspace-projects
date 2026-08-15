import { IconButton, InputAdornment } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import TextField from './TextField'

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  showPassword: boolean
  onToggleShow: () => void
  error?: string
  helperText?: string
  required?: boolean
}

export default function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  error,
  helperText,
  required,
}: PasswordFieldProps) {
  return (
    <TextField
      label={label}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      margin="normal"
      required={required}
      error={Boolean(error)}
      helperText={error || helperText}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LockOutlinedIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={onToggleShow} edge="end" size="small">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}
