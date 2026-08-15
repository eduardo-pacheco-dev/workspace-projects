import { Box, Grid, MenuItem, TextField } from '@mui/material'
import { FreelancerFormState, UpdateField } from '../../../pages/freelancers/freelancerTypes'
import SectionTitle from '../SectionTitle'

interface ContactsStepProps {
  form: FreelancerFormState
  updateField: UpdateField
}

export default function ContactsStep({ form, updateField }: ContactsStepProps) {
  return (
    <Box>
      <SectionTitle label="Contatos" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Telefone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="WhatsApp" value={form.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="CEP" value={form.cep} onChange={(e) => updateField('cep', e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Endereço" value={form.endereco} onChange={(e) => updateField('endereco', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField fullWidth label="Cidade" value={form.cidade} onChange={(e) => updateField('cidade', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="UF" value={form.uf} onChange={(e) => updateField('uf', e.target.value)} inputProps={{ maxLength: 2 }} />
        </Grid>
      </Grid>

      <SectionTitle label="Contato de Emergência" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Nome" value={form.contatoEmergenciaNome} onChange={(e) => updateField('contatoEmergenciaNome', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Telefone" value={form.contatoEmergenciaTelefone} onChange={(e) => updateField('contatoEmergenciaTelefone', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth select label="Parentesco" value={form.contatoEmergenciaParentesco} onChange={(e) => updateField('contatoEmergenciaParentesco', e.target.value)}>
            <MenuItem value="">Selecione</MenuItem>
            <MenuItem value="conjuge">Cônjuge</MenuItem>
            <MenuItem value="pai">Pai</MenuItem>
            <MenuItem value="mae">Mãe</MenuItem>
            <MenuItem value="filho">Filho(a)</MenuItem>
            <MenuItem value="irmao">Irmão(ã)</MenuItem>
            <MenuItem value="outro">Outro</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Box>
  )
}
