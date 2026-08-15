import { Alert, Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { SettingsField } from '../../pages/settings/settingsTypes'
import SettingsFormField from './SettingsFormField'

interface SettingsFormProps<T> {
  title: string
  fields: SettingsField[]
  values: T
  onChange: (key: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
  disabled: boolean
  disabledMessage?: string
}

export default function SettingsForm<T>({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  saving,
  disabled,
  disabledMessage,
}: SettingsFormProps<T>) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      {disabledMessage && <Alert severity="info" sx={{ mb: 2 }}>{disabledMessage}</Alert>}
      <Divider sx={{ mb: 3 }} />
      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={field.key}>
              <SettingsFormField
                field={field}
                value={String((values as Record<string, unknown>)[field.key] ?? '')}
                onChange={(value) => onChange(field.key, value)}
                disabled={disabled}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving || disabled}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}
