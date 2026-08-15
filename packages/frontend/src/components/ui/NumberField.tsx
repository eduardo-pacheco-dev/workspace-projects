import { TextField as MuiTextField, TextFieldProps } from '@mui/material'

interface NumberFieldProps extends Omit<TextFieldProps, 'type'> {
  type?: 'number' | 'string'
  min?: number
  max?: number
}

export default function NumberField({ type = 'number', fullWidth = true, size = 'small', min, max, inputProps, ...props }: NumberFieldProps) {
  return (
    <MuiTextField
      fullWidth={fullWidth}
      size={size}
      type={type}
      inputProps={{ min, max, ...inputProps }}
      {...props}
    />
  )
}
