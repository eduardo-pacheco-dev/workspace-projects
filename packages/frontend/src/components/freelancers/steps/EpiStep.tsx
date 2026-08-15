import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { FreelancerFormState, UpdateField, Epi } from '../../../pages/freelancers/freelancerTypes'

interface EpiStepProps {
  form: FreelancerFormState
  updateField: UpdateField
}

export default function EpiStep({ form, updateField }: EpiStepProps) {
  const addEpi = () => {
    if (!form.epiNome.trim()) return
    const item: Epi = { nome: form.epiNome.trim(), tamanho: form.epiTamanho.trim(), validade: form.epiValidade, quantidade: form.epiQtd }
    updateField('epis', [...form.epis, item])
    updateField('epiNome', '')
    updateField('epiTamanho', '')
    updateField('epiValidade', '')
    updateField('epiQtd', '')
  }

  const removeEpi = (index: number) => {
    updateField('epis', form.epis.filter((_, idx) => idx !== index))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
        <TextField fullWidth label="EPI" value={form.epiNome} onChange={(e) => updateField('epiNome', e.target.value)} placeholder="Ex.: Capacete, Luvas" />
        <TextField label="Tamanho" value={form.epiTamanho} onChange={(e) => updateField('epiTamanho', e.target.value)} sx={{ width: 110 }} />
        <TextField label="Validade" type="date" value={form.epiValidade} onChange={(e) => updateField('epiValidade', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
        <TextField label="Qtd" type="number" value={form.epiQtd} onChange={(e) => updateField('epiQtd', e.target.value)} sx={{ width: 70 }} />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addEpi} sx={{ height: 56 }}>
          Adicionar
        </Button>
      </Box>
      {form.epis.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum EPI cadastrado.</Typography>
      ) : (
        form.epis.map((epi, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {epi.nome} · {epi.tamanho || '-'}
              {epi.validade ? ` · Validade: ${epi.validade}` : ''} · Qtd: {epi.quantidade || 1}
            </Typography>
            <IconButton size="small" onClick={() => removeEpi(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))
      )}
    </Box>
  )
}
