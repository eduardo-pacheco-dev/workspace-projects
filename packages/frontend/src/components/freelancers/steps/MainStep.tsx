import { Box, Button, Chip, Grid, MenuItem, TextField, Typography } from '@mui/material'
import { FreelancerFormState, UpdateField } from '../../../pages/freelancers/freelancerTypes'
import SectionTitle from '../SectionTitle'

interface MainStepProps {
  form: FreelancerFormState
  updateField: UpdateField
  availableCompanies: { id: number; nome: string }[]
  isMasterUser: boolean
}

export default function MainStep({ form, updateField, availableCompanies, isMasterUser }: MainStepProps) {
  const addSkill = () => {
    const trimmed = form.skillInput.trim()
    if (trimmed && !form.skills.includes(trimmed)) {
      updateField('skills', [...form.skills, trimmed])
    }
    updateField('skillInput', '')
  }

  const removeSkill = (skill: string) => {
    updateField('skills', form.skills.filter((s) => s !== skill))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          component="img"
          src={form.photoFile ? URL.createObjectURL(form.photoFile) : (form.foto || '/uploads/placeholder.png')}
          onError={(e: any) => { e.target.style.visibility = 'hidden' }}
          sx={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.12)', bgcolor: 'rgba(0,0,0,0.04)' }}
        />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Foto do Colaborador</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Envie uma foto de identificação
          </Typography>
          <Button size="small" variant="outlined" component="label">
            Escolher Foto
            <input type="file" accept="image/*" hidden onChange={(e) => updateField('photoFile', e.target.files?.[0] ?? null)} />
          </Button>
        </Box>
      </Box>

      <SectionTitle label="Identificação" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Código" value={form.codigo} disabled placeholder="Gerado automaticamente" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Data de Cadastro"
            value={form.createdAt ? new Date(form.createdAt).toLocaleDateString('pt-BR') : ''}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Data de Atualização"
            value={form.updatedAt ? new Date(form.updatedAt).toLocaleDateString('pt-BR') : ''}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth select label="Status" value={form.status} onChange={(e) => updateField('status', e.target.value)} required>
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
          </TextField>
        </Grid>
        {form.isFreelancer ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Nome" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Sobrenome" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} required />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sm={6} md={6}>
            <TextField fullWidth label="Nome" value={form.nome} onChange={(e) => updateField('nome', e.target.value)} required />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label={form.isFreelancer ? 'Função' : 'Cargo'} value={form.funcao} onChange={(e) => updateField('funcao', e.target.value)} />
        </Grid>
        {!form.isFreelancer && (
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="CPF" value={form.cpf} onChange={(e) => updateField('cpf', e.target.value)} />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={form.isFreelancer ? 3 : 6}>
          <TextField
            fullWidth
            select
            label="Empresa"
            value={form.companyId ?? ''}
            onChange={(e) => updateField('companyId', e.target.value ? Number(e.target.value) : null)}
            required
            disabled={!isMasterUser}
          >
            {availableCompanies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <TextField fullWidth label="Razão Social" value={form.razaoSocial} onChange={(e) => updateField('razaoSocial', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Regional" value={form.regional} onChange={(e) => updateField('regional', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="UF" value={form.uf} onChange={(e) => updateField('uf', e.target.value)} inputProps={{ maxLength: 2 }} />
        </Grid>
      </Grid>

      <SectionTitle label="Contrato" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Tipo de Contrato" value={form.tipoContrato} onChange={(e) => updateField('tipoContrato', e.target.value)}>
            <MenuItem value="">Selecione</MenuItem>
            <MenuItem value="clt">CLT</MenuItem>
            <MenuItem value="pj">PJ</MenuItem>
            <MenuItem value="estagio">Estágio</MenuItem>
            <MenuItem value="terceirizado">Terceirizado</MenuItem>
            <MenuItem value="outro">Outro</MenuItem>
          </TextField>
        </Grid>
        {!form.isFreelancer && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Data de Admissão"
              type="date"
              value={form.dataAdmissao}
              onChange={(e) => updateField('dataAdmissao', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}
        {form.isFreelancer && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Valor Hora" type="number" value={form.hourlyRate} onChange={(e) => updateField('hourlyRate', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Nível de Experiência" value={form.experienceLevel} onChange={(e) => updateField('experienceLevel', e.target.value)} required>
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="mid">Pleno</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Disponibilidade" value={form.availability} onChange={(e) => updateField('availability', e.target.value)} required>
                <MenuItem value="available">Disponível</MenuItem>
                <MenuItem value="busy">Ocupado</MenuItem>
                <MenuItem value="unavailable">Indisponível</MenuItem>
              </TextField>
            </Grid>
          </>
        )}
      </Grid>

      {form.isFreelancer && (
        <>
          <SectionTitle label="Bio e Habilidades" />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Bio" multiline rows={3} value={form.bio} onChange={(e) => updateField('bio', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Habilidades"
                value={form.skillInput}
                onChange={(e) => updateField('skillInput', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                placeholder="Digite e pressione Enter"
              />
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {form.skills.map((skill) => (
                  <Chip key={skill} label={skill} size="small" onDelete={() => removeSkill(skill)} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}
