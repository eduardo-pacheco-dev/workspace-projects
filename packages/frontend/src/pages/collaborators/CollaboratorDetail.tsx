import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, CircularProgress, Container, Divider, Grid, IconButton, Paper, Typography } from '@mui/material'
import { ArrowBack, Edit } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import InfoItem from '../../components/ui/InfoItem'
import FreelancerModal from '../freelancers/FreelancerModal'
import CollaboratorHeaderCard from '../../components/collaborators/CollaboratorHeaderCard'
import CollaboratorSection from '../../components/collaborators/CollaboratorSection'
import SkillsChips from '../../components/collaborators/SkillsChips'
import ItemChips from '../../components/collaborators/ItemChips'
import DocumentsGrid from '../../components/collaborators/DocumentsGrid'
import { Collaborator, expLevelMap, availMap, parseJsonList, parseSkills, getCollaboratorName } from './collaboratorsTypes'

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
  const skills = parseSkills(collaborator.skills)
  const uniforms = parseJsonList<{ tipo: string; tamanho: string; quantidade: number }>(collaborator.uniforms).map((u) => ({
    label: `${u.tipo || '-'} · ${u.tamanho || '-'} · Qtd: ${u.quantidade || 1}`,
  }))
  const epis = parseJsonList<{ nome: string; tamanho: string; validade: string; quantidade: number }>(collaborator.epis).map((e) => ({
    label: `${e.nome || '-'} · ${e.tamanho || '-'}${e.validade ? ` · Val: ${e.validade}` : ''} · Qtd: ${e.quantidade || 1}`,
  }))
  const availInfo = availMap[collaborator.availability || ''] || { label: collaborator.availability || '-', color: 'warning' as const }

  const documents = [
    { label: 'RG', arquivo: collaborator.rgArquivo },
    { label: 'Carteira de Trabalho', arquivo: collaborator.carteiraArquivo },
    { label: 'Habilitação', arquivo: collaborator.habilitacaoArquivo },
    { label: 'NR 10', arquivo: collaborator.nr10Arquivo },
    { label: 'NR 35', arquivo: collaborator.nr35Arquivo },
    { label: 'ASO', arquivo: collaborator.asoArquivo },
    { label: 'Ficha de EPI', arquivo: collaborator.epiArquivo },
    { label: 'Ordem de Serviço', arquivo: collaborator.ordemServicoArquivo },
    { label: 'Contrato', arquivo: collaborator.contratoArquivo },
  ]

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
        <CollaboratorHeaderCard collaborator={collaborator} />
        <Divider sx={{ mb: 3 }} />

        <CollaboratorSection label="Dados Pessoais">
          <Grid container spacing={2}>
            <InfoItem label="Nome" value={getCollaboratorName(collaborator)} />
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
        </CollaboratorSection>

        <CollaboratorSection label="Vínculo">
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
        </CollaboratorSection>

        {isFreelancer && (
          <CollaboratorSection label="Freelancer">
            <Grid container spacing={2}>
              <InfoItem label="Valor por Hora" value={collaborator.hourlyRate != null ? `R$ ${collaborator.hourlyRate}` : undefined} />
              <InfoItem label="Nível de Experiência" value={expLevelMap[collaborator.experienceLevel || ''] || collaborator.experienceLevel} />
              <InfoItem label="Disponibilidade" value={availInfo.label} />
              <InfoItem label="Bio" value={collaborator.bio} md={12} />
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Habilidades</Typography>
                <SkillsChips skills={skills} />
              </Grid>
            </Grid>
          </CollaboratorSection>
        )}

        <CollaboratorSection label="Contato">
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
        </CollaboratorSection>

        <CollaboratorSection label="Bancário">
          <Grid container spacing={2}>
            <InfoItem label="Banco" value={collaborator.banco} />
            <InfoItem label="Agência" value={collaborator.agencia} />
            <InfoItem label="Conta" value={collaborator.conta} />
            <InfoItem label="Tipo de Conta" value={collaborator.tipoConta} />
            <InfoItem label="Titular" value={collaborator.titular} />
            <InfoItem label="PIX" value={collaborator.pix} />
          </Grid>
        </CollaboratorSection>

        <CollaboratorSection label="Treinamentos e Vencimentos">
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
        </CollaboratorSection>

        <CollaboratorSection label="Uniformes">
          <ItemChips items={uniforms} emptyMessage="Nenhum uniforme cadastrado." />
        </CollaboratorSection>

        <CollaboratorSection label="EPI">
          <ItemChips items={epis} emptyMessage="Nenhum EPI cadastrado." />
        </CollaboratorSection>

        <CollaboratorSection label="Documentos Anexos">
          <DocumentsGrid items={documents} />
        </CollaboratorSection>
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
