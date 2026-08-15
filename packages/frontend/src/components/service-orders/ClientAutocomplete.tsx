import { Autocomplete, TextField } from '@mui/material'
import { ClientOption } from '../../pages/service-orders/serviceOrdersTypes'

interface ClientAutocompleteProps {
  clients: ClientOption[]
  value: ClientOption | null
  onChange: (client: ClientOption | null) => void
  error?: string
}

export default function ClientAutocomplete({ clients, value, onChange, error }: ClientAutocompleteProps) {
  return (
    <Autocomplete
      fullWidth
      options={clients}
      getOptionLabel={(c) => c.nome}
      value={value}
      onChange={(_, v) => onChange(v)}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Cliente"
          margin="normal"
          required
          placeholder="Busque pelo nome do cliente"
          error={Boolean(error)}
          helperText={error}
        />
      )}
    />
  )
}
