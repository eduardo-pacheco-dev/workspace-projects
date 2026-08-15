import { Grid, MenuItem, TextField } from '@mui/material'
import { FreelancerFormState, UpdateField } from '../../../pages/freelancers/freelancerTypes'

interface BankStepProps {
  form: FreelancerFormState
  updateField: UpdateField
}

export default function BankStep({ form, updateField }: BankStepProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Banco" value={form.banco} onChange={(e) => updateField('banco', e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField fullWidth label="Agência" value={form.agencia} onChange={(e) => updateField('agencia', e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField fullWidth label="Conta" value={form.conta} onChange={(e) => updateField('conta', e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth select label="Tipo de Conta" value={form.tipoConta} onChange={(e) => updateField('tipoConta', e.target.value)}>
          <MenuItem value="">Selecione</MenuItem>
          <MenuItem value="corrente">Corrente</MenuItem>
          <MenuItem value="poupanca">Poupança</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Titular" value={form.titular} onChange={(e) => updateField('titular', e.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="PIX" value={form.pix} onChange={(e) => updateField('pix', e.target.value)} />
      </Grid>
    </Grid>
  )
}
