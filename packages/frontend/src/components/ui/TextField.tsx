import { TextField as MuiTextField, TextFieldProps } from '@mui/material'

export default function TextField({ fullWidth = true, size = 'small', ...props }: TextFieldProps) {
  return <MuiTextField fullWidth={fullWidth} size={size} {...props} />
}
