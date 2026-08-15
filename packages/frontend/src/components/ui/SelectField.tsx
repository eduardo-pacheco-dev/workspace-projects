import { MenuItem, TextField as MuiTextField, TextFieldProps } from '@mui/material'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends Omit<TextFieldProps, 'select' | 'onChange'> {
  options: SelectOption[]
  onChange: (value: string) => void
  allowEmpty?: boolean
  emptyLabel?: string
}

export default function SelectField({ options, onChange, allowEmpty, emptyLabel = 'Selecione', fullWidth = true, size = 'small', ...props }: SelectFieldProps) {
  return (
    <MuiTextField select fullWidth={fullWidth} size={size} {...props} onChange={(e) => onChange(e.target.value)}>
      {allowEmpty && (
        <MenuItem value="">
          <em>{emptyLabel}</em>
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </MuiTextField>
  )
}
