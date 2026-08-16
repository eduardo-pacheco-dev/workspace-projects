import { Box, Checkbox, Divider, FormControlLabel, Grid, Paper, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import GroupIcon from '@mui/icons-material/Group'
import Button from '../ui/Button'
import SelectField from '../ui/SelectField'
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
    <Paper
      elevation={0}
      sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'rgba(0, 21, 68, 0.08)',
            color: 'rgb(0, 21, 68)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GroupIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>Perfis de Acesso</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Selecione o perfil e marque quais módulos ele pode acessar. O perfil master tem acesso total e não é configurável.
      </Typography>
      <SelectField
        label="Perfil"
        value={selectedRole}
        onChange={onRoleChange}
        sx={{ mb: 3, maxWidth: 280 }}
        options={CONFIGURABLE_ROLES.map((role) => ({ value: role, label: roleLabels[role] || role }))}
      />
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
