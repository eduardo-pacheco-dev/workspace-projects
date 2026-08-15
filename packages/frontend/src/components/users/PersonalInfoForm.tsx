import { Box, Button, Divider, Grid, TextField, Typography } from '@mui/material'
import { UserProfile } from '../../pages/users/usersTypes'
import { formatDateTime } from '../../utils/format'
import { formatPhone } from '../../utils/phone'

interface PersonalInfoFormProps {
  data: UserProfile
  onChange: (data: UserProfile) => void
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
}

export default function PersonalInfoForm({ data, onChange, onSubmit, saving }: PersonalInfoFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Informações Pessoais
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nome"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Sobrenome"
            value={data.lastName || ''}
            onChange={(e) => onChange({ ...data, lastName: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Email" value={data.email} disabled />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Telefone"
            value={formatPhone(data.phone || '')}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
          />
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Conta criada em {formatDateTime(data.createdAt)}
      </Typography>
      <Button type="submit" variant="contained" size="large" disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </Box>
  )
}
