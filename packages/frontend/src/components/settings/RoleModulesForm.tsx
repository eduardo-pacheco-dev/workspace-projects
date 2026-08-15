import { Box, Button, Checkbox, Divider, FormControlLabel, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import GroupIcon from '@mui/icons-material/Group'
import { ALL_ROLE_MODULES, CONFIGURABLE_ROLES, roleLabels } from '../../pages/settings/roleModules'

interface RoleModulesFormProps {
  selectedRole: string
  modules: string[]
  saving: boolean
  onRoleChange: (role: string) => void
  onToggleModule: (value: string) => void
  onSave: () => void
}

export default function RoleModulesForm({
  selectedRole,
  modules,
  saving,
  onRoleChange,
  onToggleModule,
  onSave,
}: RoleModulesFormProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <GroupIcon color="primary" />
        <Typography variant="h6">Perfis de Acesso</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Selecione o perfil e marque quais módulos ele pode acessar. O perfil master tem acesso total e não é configurável.
      </Typography>
      <TextField
        select
        fullWidth
        size="small"
        label="Perfil"
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value)}
        sx={{ mb: 3, maxWidth: 280 }}
      >
        {CONFIGURABLE_ROLES.map((role) => (
          <MenuItem key={role} value={role}>
            {roleLabels[role] || role}
          </MenuItem>
        ))}
      </TextField>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={1}>
        {ALL_ROLE_MODULES.map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.value}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={modules.includes(module.value)}
                  onChange={() => onToggleModule(module.value)}
                />
              }
              label={module.label}
            />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={onSave}>
          {saving ? 'Salvando...' : 'Salvar perfis'}
        </Button>
      </Box>
    </Paper>
  )
}
