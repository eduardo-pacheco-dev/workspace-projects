import { Box, Grid, MenuItem, TextField } from '@mui/material'
import { FreelancerFormState, UpdateField } from '../../../pages/freelancers/freelancerTypes'
import SectionTitle from '../SectionTitle'

interface TrainingsStepProps {
  form: FreelancerFormState
  updateField: UpdateField
}

function DateField({ label, value, onChange, cols = 3 }: {
  label: string
  value: string
  onChange: (value: string) => void
  cols?: number
}) {
  return (
    <Grid item xs={12} sm={6} md={cols}>
      <TextField fullWidth label={label} type="date" value={value} onChange={(e) => onChange(e.target.value)} InputLabelProps={{ shrink: true }} />
    </Grid>
  )
}

export default function TrainingsStep({ form, updateField }: TrainingsStepProps) {
  return (
    <Box>
      <SectionTitle label="Saúde e Segurança" />
      <Grid container spacing={2}>
        <DateField label="Data ASO" value={form.dataAso} onChange={(v) => updateField('dataAso', v)} />
        <DateField label="Data NR06 Ficha de EPI" value={form.dataNr06} onChange={(v) => updateField('dataNr06', v)} />
        <DateField label="Data NR35 Trabalho em Altura" value={form.dataNr35} onChange={(v) => updateField('dataNr35', v)} />
        <DateField label="Data NR10 Eletricidade" value={form.dataNr10} onChange={(v) => updateField('dataNr10', v)} />
        <DateField label="Data NR75 Primeiros Socorros" value={form.dataNr75} onChange={(v) => updateField('dataNr75', v)} />
        <DateField label="Data NR01 Ordem de Serviço" value={form.dataNr01} onChange={(v) => updateField('dataNr01', v)} />
      </Grid>

      <SectionTitle label="Integração" />
      <Grid container spacing={2}>
        <DateField label="Data Integração" value={form.dataIntegracao} onChange={(v) => updateField('dataIntegracao', v)} />
        <DateField label="Data Lista Ferramental" value={form.dataListaFerramental} onChange={(v) => updateField('dataListaFerramental', v)} />
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth select label="Crachá" value={form.cracha} onChange={(e) => updateField('cracha', e.target.value)}>
            <MenuItem value="">Selecione</MenuItem>
            <MenuItem value="sim">Sim</MenuItem>
            <MenuItem value="nao">Não</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <SectionTitle label="Nokia" />
      <Grid container spacing={2}>
        <DateField label="Data H&S" value={form.dataHs} onChange={(v) => updateField('dataHs', v)} />
        <DateField label="Data LTW" value={form.dataLtw} onChange={(v) => updateField('dataLtw', v)} />
        <DateField label="Data Cadastro Nokia" value={form.dataCadastroNokia} onChange={(v) => updateField('dataCadastroNokia', v)} />
      </Grid>

      <SectionTitle label="Outros Registros" />
      <Grid container spacing={2}>
        <DateField label="Data Cadastro Ericsson" value={form.dataCadastroEricsson} onChange={(v) => updateField('dataCadastroEricsson', v)} />
        <DateField label="Data Cadastro Telebit" value={form.dataCadastroTelebit} onChange={(v) => updateField('dataCadastroTelebit', v)} />
      </Grid>

      <SectionTitle label="Vencimentos" />
      <Grid container spacing={2}>
        <DateField label="ASO" value={form.vencimentoAso} onChange={(v) => updateField('vencimentoAso', v)} />
        <DateField label="NR35" value={form.vencimentoNr35} onChange={(v) => updateField('vencimentoNr35', v)} />
        <DateField label="NR10" value={form.vencimentoNr10} onChange={(v) => updateField('vencimentoNr10', v)} />
      </Grid>
    </Box>
  )
}
