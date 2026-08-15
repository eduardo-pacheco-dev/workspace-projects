import { TextField as MuiTextField, TextFieldProps } from '@mui/material'

interface TextAreaProps extends Omit<TextFieldProps, 'multiline'> {
  minRows?: number
}

export default function TextArea({ fullWidth = true, size = 'small', minRows = 3, ...props }: TextAreaProps) {
  return <MuiTextField fullWidth={fullWidth} size={size} multiline minRows={minRows} {...props} />
}
