import { MenuItem, TextField } from '@mui/material'
import { SettingsField } from '../../pages/settings/settingsTypes'

interface SettingsFormFieldProps {
  field: SettingsField
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function SettingsFormField({ field, value, onChange, disabled }: SettingsFormFieldProps) {
  const common = {
    fullWidth: true,
    size: 'small' as const,
    label: field.label,
    value,
    disabled,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
  }

  if (field.type === 'select') {
    return (
      <TextField select {...common}>
        {field.options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    )
  }

  if (field.type === 'textarea') {
    return <TextField multiline rows={2} {...common} />
  }

  return <TextField type={field.type === 'email' ? 'email' : 'text'} {...common} />
}
