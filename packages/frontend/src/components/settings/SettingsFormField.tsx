import { SettingsField } from '../../pages/settings/settingsTypes'
import TextField from '../ui/TextField'
import TextArea from '../ui/TextArea'
import SelectField from '../ui/SelectField'

interface SettingsFormFieldProps {
  field: SettingsField
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function SettingsFormField({ field, value, onChange, disabled }: SettingsFormFieldProps) {
  const common = {
    label: field.label,
    value,
    disabled,
  }

  if (field.type === 'select') {
    return <SelectField {...common} options={field.options ?? []} onChange={onChange} />
  }

  if (field.type === 'textarea') {
    return <TextArea {...common} minRows={2} onChange={(e) => onChange(e.target.value)} />
  }

  return (
    <TextField
      {...common}
      type={field.type === 'email' ? 'email' : 'text'}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
