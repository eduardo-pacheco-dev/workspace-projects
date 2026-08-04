import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
  Chip,
  Paper,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Stack,
} from '@mui/material'
import { ArrowBack, Edit, Person } from '@mui/icons-material'
import api from '../../services/api'
import FreelancerModal from '../freelancers/FreelancerModal'

interface Collaborator {
  id: number
  codigo: string | null
  nome: string | null
  isFreelancer: boolean
  status: string
  companyId: number
  company?: { id: number; nome: string } | null
  firstName?: string | null
  lastName?: string | null
  cpf?: string | null
  rg?: string | null
  orgaoEmissor?: string | null
  birthDate?: string | null
  naturalidade?: string | null
  sexo?: string | null
  cnpj?: string | null
  tituloEleitor?: string | null
  cnh?: string | null
  cnhValidade?: string | null
  pis?: string | null
  cargo?: string | null
  funcao?: string | null
  razaoSocial?: string | null
  tipoContrato?: string | null
  regional?: string | null
  uf?: string | null
  dataAdmissao?: string | null
  email?: string | null
  telefone?: string | null
  whatsapp?: string | null
  cep?: string | null
  endereco?: string | null
  cidade?: string | null
  contatoEmergenciaNome?: string | null
  contatoEmergenciaTelefone?: string | null
  contatoEmergenciaParentesco?: string | null
  banco?: string | null
  agencia?: string | null
  conta?: string | null
  tipoConta?: string | null
  titular?: string | null
  pix?: string | null
  foto?: string | null
  bio?: string | null
  hourlyRate?: number | null
  skills?: string | null
  experienceLevel?: string | null
  availability?: string | null
  dataAso?: string | null
  dataNr06?: string | null
  dataNr35?: string | null
  dataNr10?: string | null
  dataNr75?: string | null
  dataNr01?: string | null
  dataIntegracao?: string | null
  dataListaFerramental?: string | null
  cracha?: string | null
  dataHs?: string | null
  dataLtw?: string | null
  dataCadastroNokia?: string | null
  dataCadastroEricsson?: string | null
  dataCadastroTelebit?: string | null
  vencimentoAso?: string | null
  vencimentoNr35?: string | null
  vencimentoNr10?: string | null
  uniforms?: string | null
  epis?: string | null
  rgArquivo?: string | null
  carteiraArquivo?: string | null
  habilitacaoArquivo?: string | null
  nr10Arquivo?: string | null
  nr35Arquivo?: string | null
  asoArquivo?: string | null
  epiArquivo?: string | null
  ordemServicoArquivo?: string | null
  contratoArquivo?: string | null
  createdAt?: string
  updatedAt?: string
}

const expLevelMap: Record<string, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Sênior',
  lead: 'Lead',
}

const availMap: Record<string, { label: string; color: 'success' | 'warning' | 'error' }> = {
  available: { label: 'Disponível', color: 'success' },
  busy: { label: 'Ocupado', color: 'warning' },
  unavailable: { label: 'Indisponível', color: 'error' },
}

const parseJsonList = (value: string | null | undefined): any[] => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function CollaboratorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api.get(`/collaborators/${id}`)
      .then((res) => setCollaborator(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>
  if (!collaborator) return <Container sx={{ mt: 4 }}><Alert severity="warning">Registro não encontrado.</Alert></Container>

  const isFreelancer = collaborator.isFreelancer
  const entityLabel = isFreelancer ? 'Freelancer' : 'Colaborador'
  const nome = collaborator.nome || [collaborator.firstName, collaborator.lastName].filter(Boolean).join(' ')
  const skills = typeof collaborator.skills === 'string'
    ? collaborator.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : collaborator.skills || []
  const uniforms = parseJsonList(collaborator.uniforms)
  const epis = parseJsonList(collaborator.epis)
  const availInfo = availMap[collaborator.availability || ''] || { label: collaborator.availability || '-', color: 'warning' as const }

  const sectionTitle = (label: string) => (
    <Typography
      variant="subtitle2"
      sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 2, mt: 1 }}
    >
      {label}
    </Typography>
  )

  const InfoItem = ({ label, value, full }: { label: string; value?: string | number | null; full?: boolean }) => (
    <Grid item xs={12} sm={full ? 12 : 6} md={full ? 12 : 4}>
      <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" gutterBottom>{value || '-'}</Typography>
    </Grid>
  )

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate('/collaborators')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Detalhes do {entityLabel}</Typography>
        <Button variant="contained" startIcon={<Edit />} onClick={() => setModalOpen(true)}>
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Avatar
            src={collaborator.foto || undefined}
            sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: 32 }}
          >
            <Person />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 200 }}>
            <Typography variant="h4">{nome}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                size="small"
                label={entityLabel}
                color={isFreelancer ? 'primary' : 'default'}
              />
              <Chip
                size="small"
                label={collaborator.status === 'ativo' ? 'Ativo' : 'Inativo'}
                color={collaborator.status === 'ativo' ? 'success' : 'default'}
              />
              {isFreelancer && <Chip size="small" label={availInfo.label} color={availInfo.color} />}
            </Stack>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            {collaborator.codigo && (
              <Typography variant="subtitle2" color="text.secondary">Código</Typography>
            )}
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{collaborator.codigo || '-'}</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Empresa</Typography>
            <Typography variant="body1">{collaborator.company?.nome || '-'}</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {sectionTitle('Dados Pessoais')}
        <Grid container spacing={2}>
          <InfoItem label="Nome" value={nome} />
          <InfoItem label="CPF" value={collaborator.cpf} />
          <InfoItem label="RG" value={collaborator.rg} />
          <InfoItem label="Órgão Emissor" value={collaborator.orgaoEmissor} />
          <InfoItem label="Data de Nascimento" value={collaborator.birthDate} />
          <InfoItem label="Naturalidade" value={collaborator.naturalidade} />
          <InfoItem label="Sexo" value={collaborator.sexo} />
          <InfoItem label="CNPJ" value={collaborator.cnpj} />
          <InfoItem label="Título de Eleitor" value={collaborator.tituloEleitor} />
          <InfoItem label="CNH" value={collaborator.cnh} />
          <InfoItem label="Validade CNH" value={collaborator.cnhValidade} />
          <InfoItem label="PIS" value={collaborator.pis} />
        </Grid>

        {sectionTitle('Vínculo')}
        <Grid container spacing={2}>
          <InfoItem label={isFreelancer ? 'Função' : 'Cargo'} value={collaborator.funcao || collaborator.cargo} />
          <InfoItem label="Razão Social" value={collaborator.razaoSocial} />
          <InfoItem label="Tipo de Contrato" value={collaborator.tipoContrato} />
          <InfoItem label="Regional" value={collaborator.regional} />
          <InfoItem label="UF" value={collaborator.uf} />
          <InfoItem label="Data de Admissão" value={collaborator.dataAdmissao} />
          <InfoItem label="Data de Cadastro" value={collaborator.createdAt ? new Date(collaborator.createdAt).toLocaleDateString('pt-BR') : undefined} />
          <InfoItem label="Última Atualização" value={collaborator.updatedAt ? new Date(collaborator.updatedAt).toLocaleDateString('pt-BR') : undefined} />
        </Grid>

        {isFreelancer && (
          <>
            {sectionTitle('Freelancer')}
            <Grid container spacing={2}>
              <InfoItem label="Valor por Hora" value={collaborator.hourlyRate != null ? `R$ ${collaborator.hourlyRate}` : undefined} />
              <InfoItem label="Nível de Experiência" value={expLevelMap[collaborator.experienceLevel || ''] || collaborator.experienceLevel} />
              <InfoItem label="Disponibilidade" value={availInfo.label} />
              <InfoItem label="Bio" value={collaborator.bio} full />
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Habilidades</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {skills.length > 0
                    ? skills.map((s) => <Chip key={s} label={s} size="small" variant="outlined" color="primary" />)
                    : <Typography variant="body2" color="text.secondary">Nenhuma habilidade cadastrada</Typography>
                  }
                </Box>
              </Grid>
            </Grid>
          </>
        )}

        {sectionTitle('Contato')}
        <Grid container spacing={2}>
          <InfoItem label="Email" value={collaborator.email} />
          <InfoItem label="Telefone" value={collaborator.telefone} />
          <InfoItem label="WhatsApp" value={collaborator.whatsapp} />
          <InfoItem label="CEP" value={collaborator.cep} />
          <InfoItem label="Endereço" value={collaborator.endereco} />
          <InfoItem label="Cidade" value={collaborator.cidade} />
          <InfoItem label="UF" value={collaborator.uf} />
          <InfoItem label="Contato de Emergência" value={collaborator.contatoEmergenciaNome} />
          <InfoItem label="Telefone Emergência" value={collaborator.contatoEmergenciaTelefone} />
          <InfoItem label="Parentesco" value={collaborator.contatoEmergenciaParentesco} />
        </Grid>

        {sectionTitle('Bancário')}
        <Grid container spacing={2}>
          <InfoItem label="Banco" value={collaborator.banco} />
          <InfoItem label="Agência" value={collaborator.agencia} />
          <InfoItem label="Conta" value={collaborator.conta} />
          <InfoItem label="Tipo de Conta" value={collaborator.tipoConta} />
          <InfoItem label="Titular" value={collaborator.titular} />
          <InfoItem label="PIX" value={collaborator.pix} />
        </Grid>

        <Box sx={{ mb: 3 }}>
          {sectionTitle('Treinamentos e Vencimentos')}
          <Grid container spacing={2}>
            <InfoItem label="Data ASO" value={collaborator.dataAso} />
            <InfoItem label="Data NR06 Ficha de EPI" value={collaborator.dataNr06} />
            <InfoItem label="Data NR35 Trabalho em Altura" value={collaborator.dataNr35} />
            <InfoItem label="Data NR10 Eletricidade" value={collaborator.dataNr10} />
            <InfoItem label="Data NR75 Primeiros Socorros" value={collaborator.dataNr75} />
            <InfoItem label="Data NR01 Ordem de Serviço" value={collaborator.dataNr01} />
            <InfoItem label="Data Integração" value={collaborator.dataIntegracao} />
            <InfoItem label="Data Lista Ferramental" value={collaborator.dataListaFerramental} />
            <InfoItem label="Crachá" value={collaborator.cracha} />
            <InfoItem label="Data H&S" value={collaborator.dataHs} />
            <InfoItem label="Data LTW" value={collaborator.dataLtw} />
            <InfoItem label="Data Cadastro Nokia" value={collaborator.dataCadastroNokia} />
            <InfoItem label="Data Cadastro Ericsson" value={collaborator.dataCadastroEricsson} />
            <InfoItem label="Data Cadastro Telebit" value={collaborator.dataCadastroTelebit} />
            <InfoItem label="Vencimento ASO" value={collaborator.vencimentoAso} />
            <InfoItem label="Vencimento NR35" value={collaborator.vencimentoNr35} />
            <InfoItem label="Vencimento NR10" value={collaborator.vencimentoNr10} />
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          {sectionTitle('Uniformes')}
          {uniforms.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum uniforme cadastrado.</Typography>
          ) : (
            <Grid container spacing={1}>
              {uniforms.map((u, i) => (
                <Grid item key={i} xs={12} sm={6} md={4}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${u.tipo || '-'} · ${u.tamanho || '-'} · Qtd: ${u.quantidade || 1}`}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          {sectionTitle('EPI')}
          {epis.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum EPI cadastrado.</Typography>
          ) : (
            <Grid container spacing={1}>
              {epis.map((ep, i) => (
                <Grid item key={i} xs={12} sm={6} md={4}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${ep.nome || '-'} · ${ep.tamanho || '-'}${ep.validade ? ` · Val: ${ep.validade}` : ''} · Qtd: ${ep.quantidade || 1}`}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {sectionTitle('Documentos Anexos')}
        <Grid container spacing={2}>
          {[
            { label: 'RG', arquivo: collaborator.rgArquivo },
            { label: 'Carteira de Trabalho', arquivo: collaborator.carteiraArquivo },
            { label: 'Habilitação', arquivo: collaborator.habilitacaoArquivo },
            { label: 'NR 10', arquivo: collaborator.nr10Arquivo },
            { label: 'NR 35', arquivo: collaborator.nr35Arquivo },
            { label: 'ASO', arquivo: collaborator.asoArquivo },
            { label: 'Ficha de EPI', arquivo: collaborator.epiArquivo },
            { label: 'Ordem de Serviço', arquivo: collaborator.ordemServicoArquivo },
            { label: 'Contrato', arquivo: collaborator.contratoArquivo },
          ].map((item) => (
            <Grid item xs={12} sm={4} md={3} key={item.label}>
              <Box sx={{ border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 2, p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{item.label}</Typography>
                {item.arquivo ? (
                  <Button size="small" variant="outlined" component="a" href={item.arquivo} target="_blank" rel="noreferrer">
                    Ver anexo
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">Sem anexo</Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/collaborators')}>
          Voltar para a Lista
        </Button>
      </Box>

      <FreelancerModal
        open={modalOpen}
        editId={Number(id)}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </Container>
  )
}
