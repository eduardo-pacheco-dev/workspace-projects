import { Box, Button, IconButton, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { FreelancerFormState, UpdateField, Uniform } from '../../../pages/freelancers/freelancerTypes'

interface UniformsStepProps {
  form: FreelancerFormState
  updateField: UpdateField
}

export default function UniformsStep({ form, updateField }: UniformsStepProps) {
  const addUniform = () => {
    if (!form.uniformTipo.trim()) return
    const item: Uniform = { tipo: form.uniformTipo.trim(), tamanho: form.uniformTamanho.trim(), quantidade: form.uniformQtd }
    updateField('uniforms', [...form.uniforms, item])
    updateField('uniformTipo', '')
    updateField('uniformTamanho', '')
    updateField('uniformQtd', '')
  }

  const removeUniform = (index: number) => {
    updateField('uniforms', form.uniforms.filter((_, idx) => idx !== index))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
        <TextField fullWidth label="Tipo" value={form.uniformTipo} onChange={(e) => updateField('uniformTipo', e.target.value)} placeholder="Ex.: Camiseta, Calça" />
        <TextField label="Tamanho" value={form.uniformTamanho} onChange={(e) => updateField('uniformTamanho', e.target.value)} sx={{ width: 120 }} placeholder="P/M/G" />
        <TextField label="Qtd" type="number" value={form.uniformQtd} onChange={(e) => updateField('uniformQtd', e.target.value)} sx={{ width: 80 }} />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addUniform} sx={{ height: 56 }}>
          Adicionar
        </Button>
      </Box>
      {form.uniforms.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum uniforme cadastrado.</Typography>
      ) : (
        form.uniforms.map((uniform, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {uniform.tipo} · {uniform.tamanho || '-'} · Qtd: {uniform.quantidade || 1}
            </Typography>
            <IconButton size="small" onClick={() => removeUniform(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))
      )}
    </Box>
  )
}
