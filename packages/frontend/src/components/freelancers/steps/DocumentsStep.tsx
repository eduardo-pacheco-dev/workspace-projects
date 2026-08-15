import { Box, Grid, MenuItem, TextField } from '@mui/material'
import { FreelancerFormState, UpdateField } from '../../../pages/freelancers/freelancerTypes'
import SectionTitle from '../SectionTitle'
import DocumentUploadCard from '../DocumentUploadCard'

interface DocumentsStepProps {
  form: FreelancerFormState
  updateField: UpdateField
}

const DOCUMENTS = [
  { key: 'rg', label: 'RG' },
  { key: 'carteira', label: 'Carteira de Trabalho' },
  { key: 'habilitacao', label: 'Habilitação' },
  { key: 'nr10', label: 'NR 10' },
  { key: 'nr35', label: 'NR 35' },
  { key: 'aso', label: 'ASO' },
  { key: 'epi', label: 'Ficha de EPI' },
  { key: 'ordemServico', label: 'Ordem de Serviço' },
  { key: 'contrato', label: 'Contrato' },
] as const

type DocKey = (typeof DOCUMENTS)[number]['key']

const ARCHIVO_KEY: Record<DocKey, keyof FreelancerFormState> = {
  rg: 'rgArquivo',
  carteira: 'carteiraArquivo',
  habilitacao: 'habilitacaoArquivo',
  nr10: 'nr10Arquivo',
  nr35: 'nr35Arquivo',
  aso: 'asoArquivo',
  epi: 'epiArquivo',
  ordemServico: 'ordemServicoArquivo',
  contrato: 'contratoArquivo',
}

const FILE_KEY: Record<DocKey, keyof FreelancerFormState> = {
  rg: 'rgFile',
  carteira: 'carteiraFile',
  habilitacao: 'habilitacaoFile',
  nr10: 'nr10File',
  nr35: 'nr35File',
  aso: 'asoFile',
  epi: 'epiFile',
  ordemServico: 'ordemServicoFile',
  contrato: 'contratoFile',
}

export default function DocumentsStep({ form, updateField }: DocumentsStepProps) {
  return (
    <Box>
      <SectionTitle label="Identificação Pessoal" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="CPF" value={form.cpf} onChange={(e) => updateField('cpf', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="RG" value={form.rg} onChange={(e) => updateField('rg', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Órgão Emissor" value={form.orgaoEmissor} onChange={(e) => updateField('orgaoEmissor', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Data de Nascimento" type="date" value={form.birthDate} onChange={(e) => updateField('birthDate', e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Naturalidade" value={form.naturalidade} onChange={(e) => updateField('naturalidade', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth select label="Sexo" value={form.sexo} onChange={(e) => updateField('sexo', e.target.value)}>
            <MenuItem value="">Selecione</MenuItem>
            <MenuItem value="masculino">Masculino</MenuItem>
            <MenuItem value="feminino">Feminino</MenuItem>
            <MenuItem value="outro">Outro</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <SectionTitle label="Vínculos Trabalhistas" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="PIS" value={form.pis} onChange={(e) => updateField('pis', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="CNPJ" value={form.cnpj} onChange={(e) => updateField('cnpj', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Título de Eleitor" value={form.tituloEleitor} onChange={(e) => updateField('tituloEleitor', e.target.value)} />
        </Grid>
      </Grid>

      <SectionTitle label="Habilitação" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="CNH" value={form.cnh} onChange={(e) => updateField('cnh', e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Validade CNH" type="date" value={form.cnhValidade} onChange={(e) => updateField('cnhValidade', e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
      </Grid>

      <SectionTitle label="Documentos Anexos" />
      <Grid container spacing={2}>
        {DOCUMENTS.map((doc) => (
          <DocumentUploadCard
            key={doc.key}
            label={doc.label}
            arquivo={String(form[ARCHIVO_KEY[doc.key]])}
            file={form[FILE_KEY[doc.key]] as File | null}
            onFileChange={(file) => updateField(FILE_KEY[doc.key], file)}
          />
        ))}
      </Grid>
    </Box>
  )
}
