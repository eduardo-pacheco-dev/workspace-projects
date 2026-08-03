import { useState, useEffect, FormEvent, KeyboardEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  MenuItem,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepButton,
  Grid,
  IconButton,
  Divider,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

interface FreelancerModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
  defaultType?: 'freelancer' | 'colaborador'
}

interface Uniform {
  tipo: string
  tamanho: string
  quantidade: string
}

interface Epi {
  nome: string
  tamanho: string
  validade: string
  quantidade: string
}

const steps = [
  'Dados Principais',
  'Documentação',
  'Contatos',
  'Bancários',
  'Treinamentos',
  'Uniformes',
  'EPI',
]

const collaboratorSteps = ['Dados Principais', 'Contatos']

const parseJsonList = (value: string | null | undefined, fallback: any[]): any[] => {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export default function FreelancerModal({ open, editId, onClose, onSaved, defaultType = 'freelancer' }: FreelancerModalProps) {
  const isEdit = Boolean(editId)
  const { user: currentUser } = useAuth()
  const [step, setStep] = useState(0)

  const [isFreelancer, setIsFreelancer] = useState(defaultType === 'freelancer')
  const [nome, setNome] = useState('')
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [companies, setCompanies] = useState<{ id: number; nome: string }[]>([])
  const [dataAdmissao, setDataAdmissao] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [bio, setBio] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [experienceLevel, setExperienceLevel] = useState('junior')
  const [availability, setAvailability] = useState('available')
  const [hourlyRate, setHourlyRate] = useState('')
  const [codigo, setCodigo] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [tipoContrato, setTipoContrato] = useState('')
  const [regional, setRegional] = useState('')
  const [funcao, setFuncao] = useState('')
  const [status, setStatus] = useState('ativo')
  const [foto, setFoto] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [createdAt, setCreatedAt] = useState('')
  const [updatedAt, setUpdatedAt] = useState('')

  const [cpf, setCpf] = useState('')
  const [rg, setRg] = useState('')
  const [orgaoEmissor, setOrgaoEmissor] = useState('')
  const [naturalidade, setNaturalidade] = useState('')
  const [sexo, setSexo] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [tituloEleitor, setTituloEleitor] = useState('')
  const [cnh, setCnh] = useState('')
  const [cnhValidade, setCnhValidade] = useState('')
  const [pis, setPis] = useState('')
  const [rgArquivo, setRgArquivo] = useState('')
  const [carteiraArquivo, setCarteiraArquivo] = useState('')
  const [habilitacaoArquivo, setHabilitacaoArquivo] = useState('')
  const [rgFile, setRgFile] = useState<File | null>(null)
  const [carteiraFile, setCarteiraFile] = useState<File | null>(null)
  const [habilitacaoFile, setHabilitacaoFile] = useState<File | null>(null)

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('')
  const [contatoEmergenciaTelefone, setContatoEmergenciaTelefone] = useState('')
  const [contatoEmergenciaParentesco, setContatoEmergenciaParentesco] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [cep, setCep] = useState('')

  const [banco, setBanco] = useState('')
  const [agencia, setAgencia] = useState('')
  const [conta, setConta] = useState('')
  const [tipoConta, setTipoConta] = useState('')
  const [pix, setPix] = useState('')
  const [titular, setTitular] = useState('')

  const [dataAso, setDataAso] = useState('')
  const [dataNr06, setDataNr06] = useState('')
  const [dataNr35, setDataNr35] = useState('')
  const [dataNr10, setDataNr10] = useState('')
  const [dataNr75, setDataNr75] = useState('')
  const [dataNr01, setDataNr01] = useState('')
  const [dataIntegracao, setDataIntegracao] = useState('')
  const [dataListaFerramental, setDataListaFerramental] = useState('')
  const [cracha, setCracha] = useState('')
  const [dataHs, setDataHs] = useState('')
  const [dataLtw, setDataLtw] = useState('')
  const [dataCadastroNokia, setDataCadastroNokia] = useState('')
  const [dataCadastroEricsson, setDataCadastroEricsson] = useState('')
  const [dataCadastroTelebit, setDataCadastroTelebit] = useState('')
  const [vencimentoAso, setVencimentoAso] = useState('')
  const [vencimentoNr35, setVencimentoNr35] = useState('')
  const [vencimentoNr10, setVencimentoNr10] = useState('')

  const [uniforms, setUniforms] = useState<Uniform[]>([])
  const [uniformTipo, setUniformTipo] = useState('')
  const [uniformTamanho, setUniformTamanho] = useState('')
  const [uniformQtd, setUniformQtd] = useState('')

  const [epis, setEpis] = useState<Epi[]>([])
  const [epiNome, setEpiNome] = useState('')
  const [epiTamanho, setEpiTamanho] = useState('')
  const [epiValidade, setEpiValidade] = useState('')
  const [epiQtd, setEpiQtd] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)

  const activeSteps = isFreelancer ? steps : collaboratorSteps

  const isMasterUser = currentUser?.role === 'master'
  const availableCompanies = isMasterUser
    ? companies
    : currentUser?.companyId != null
      ? [{ id: currentUser.companyId, nome: currentUser.companyName || '' }]
      : []

  useEffect(() => {
    if (!open) return
    if (isMasterUser) {
      api
        .get('/companies', { params: { limit: 100, sortBy: 'nome', sortOrder: 'ASC' } })
        .then((res) => {
          const d = res.data
          setCompanies(Array.isArray(d) ? d : d.data ?? [])
        })
        .catch(() => {})
    } else if (currentUser?.companyId != null) {
      setCompanies([{ id: currentUser.companyId, nome: currentUser.companyName || '' }])
      if (!editId) setCompanyId(currentUser.companyId)
    }
  }, [open, isMasterUser, editId, currentUser?.companyId, currentUser?.companyName])

  const buildPayload = (): any => {
    const payload: any = {
      isFreelancer,
      companyId,
      status,
      funcao,
      razaoSocial,
      tipoContrato,
      regional,
      cpf,
      rg,
      orgaoEmissor,
      naturalidade,
      sexo,
      cnpj,
      tituloEleitor,
      cnh,
      cnhValidade,
      pis,
      rgArquivo,
      carteiraArquivo,
      habilitacaoArquivo,
      phone,
      whatsapp,
      contatoEmergenciaNome,
      contatoEmergenciaTelefone,
      contatoEmergenciaParentesco,
      endereco,
      cidade,
      uf,
      cep,
      banco,
      agencia,
      conta,
      tipoConta,
      pix,
      titular,
      dataAso,
      dataNr06,
      dataNr35,
      dataNr10,
      dataNr75,
      dataNr01,
      dataIntegracao,
      dataListaFerramental,
      cracha: cracha || undefined,
      dataHs,
      dataLtw,
      dataCadastroNokia,
      dataCadastroEricsson,
      dataCadastroTelebit,
      vencimentoAso,
      vencimentoNr35,
      vencimentoNr10,
      uniforms: JSON.stringify(uniforms),
      epis: JSON.stringify(epis),
      birthDate,
    }
    if (email) payload.email = email
    if (isFreelancer) {
      payload.firstName = firstName
      payload.lastName = lastName
      payload.bio = bio
      payload.hourlyRate = hourlyRate ? Number(hourlyRate) : undefined
      payload.skills = skills.join(', ')
      payload.experienceLevel = experienceLevel
      payload.availability = availability
    } else {
      payload.nome = nome
      payload.cargo = funcao
      payload.dataAdmissao = dataAdmissao
    }
    return payload
  }

  const uploadPhoto = async (id: number) => {
    if (!photoFile) return
    const form = new FormData()
    form.append('file', photoFile)
    const res = await api.post(`/collaborators/${id}/photo`, form)
    setFoto(res.data.foto || '')
  }

  const uploadDocument = async (id: number, tipo: 'rg' | 'carteira' | 'habilitacao', file: File | null) => {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await api.post(`/collaborators/${id}/document/${tipo}`, form)
    if (tipo === 'rg') setRgArquivo(res.data.rgArquivo || '')
    if (tipo === 'carteira') setCarteiraArquivo(res.data.carteiraArquivo || '')
    if (tipo === 'habilitacao') setHabilitacaoArquivo(res.data.habilitacaoArquivo || '')
  }

  const uploadDocuments = async (id: number) => {
    await uploadDocument(id, 'rg', rgFile)
    await uploadDocument(id, 'carteira', carteiraFile)
    await uploadDocument(id, 'habilitacao', habilitacaoFile)
  }

  const saveCurrent = async (): Promise<number> => {
    setError('')
    setLoading(true)
    try {
      const payload = buildPayload()
      if (savedId != null) {
        const res = await api.patch(`/collaborators/${savedId}`, payload)
        await uploadPhoto(savedId)
        await uploadDocuments(savedId)
        setCreatedAt(res.data.createdAt || createdAt)
        setUpdatedAt(res.data.updatedAt || updatedAt)
        return savedId
      }
      const res = await api.post('/collaborators', payload)
      const id = res.data.id
      setSavedId(id)
      setCodigo(res.data.codigo || '')
      setCreatedAt(res.data.createdAt || '')
      setUpdatedAt(res.data.updatedAt || '')
      await uploadPhoto(id)
      await uploadDocuments(id)
      return id
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const goTo = async (nextStep: number) => {
    try {
      await saveCurrent()
      setStep(nextStep)
    } catch {
      /* erro exibido pelo saveCurrent */
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await saveCurrent()
      onSaved()
      handleClose()
    } catch {
      /* erro exibido pelo saveCurrent */
    }
  }

  useEffect(() => {
    if (open) {
      setSavedId(editId ?? null)
      setIsFreelancer(defaultType === 'freelancer')
      setCompanyId(null)
      setNome('')
      setDataAdmissao('')
    }
    if (open && editId) {
      api.get(`/collaborators/${editId}`)
        .then((res) => {
          const data = res.data
          setIsFreelancer(Boolean(data.isFreelancer))
          setCompanyId(data.companyId ?? null)
          setDataAdmissao(data.dataAdmissao || '')
          setNome(data.nome && !data.firstName ? data.nome : '')
          setFirstName(data.firstName || '')
          setLastName(data.lastName || '')
          setBirthDate(data.birthDate || '')
          setBio(data.bio || '')
          setEmail(data.email || '')
          setHourlyRate(data.hourlyRate != null ? String(data.hourlyRate) : '')
          setCodigo(data.codigo || '')
          setRazaoSocial(data.razaoSocial || '')
          setTipoContrato(data.tipoContrato || '')
          setRegional(data.regional || '')
          setFuncao(data.funcao || data.cargo || '')
          setStatus(data.status || 'ativo')
          setFoto(data.foto || '')
          setCreatedAt(data.createdAt || '')
          setUpdatedAt(data.updatedAt || '')
          const parsedSkills = typeof data.skills === 'string'
            ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
            : data.skills || []
          setSkills(parsedSkills)
          setExperienceLevel(data.experienceLevel || 'junior')
          setAvailability(data.availability || 'available')

          setCpf(data.cpf || '')
          setRg(data.rg || '')
          setOrgaoEmissor(data.orgaoEmissor || '')
          setNaturalidade(data.naturalidade || '')
          setSexo(data.sexo || '')
          setCnpj(data.cnpj || '')
          setTituloEleitor(data.tituloEleitor || '')
          setCnh(data.cnh || '')
          setCnhValidade(data.cnhValidade || '')
          setPis(data.pis || '')
          setRgArquivo(data.rgArquivo || '')
          setCarteiraArquivo(data.carteiraArquivo || '')
          setHabilitacaoArquivo(data.habilitacaoArquivo || '')

          setPhone(data.phone || '')
          setWhatsapp(data.whatsapp || '')
          setContatoEmergenciaNome(data.contatoEmergenciaNome || '')
          setContatoEmergenciaTelefone(data.contatoEmergenciaTelefone || '')
          setContatoEmergenciaParentesco(data.contatoEmergenciaParentesco || '')
          setEndereco(data.endereco || '')
          setCidade(data.cidade || '')
          setUf(data.uf || '')
          setCep(data.cep || '')

          setBanco(data.banco || '')
          setAgencia(data.agencia || '')
          setConta(data.conta || '')
          setTipoConta(data.tipoConta || '')
          setPix(data.pix || '')
          setTitular(data.titular || '')

          setDataAso(data.dataAso || '')
          setDataNr06(data.dataNr06 || '')
          setDataNr35(data.dataNr35 || '')
          setDataNr10(data.dataNr10 || '')
          setDataNr75(data.dataNr75 || '')
          setDataNr01(data.dataNr01 || '')
          setDataIntegracao(data.dataIntegracao || '')
          setDataListaFerramental(data.dataListaFerramental || '')
          setCracha(data.cracha || '')
          setDataHs(data.dataHs || '')
          setDataLtw(data.dataLtw || '')
          setDataCadastroNokia(data.dataCadastroNokia || '')
          setDataCadastroEricsson(data.dataCadastroEricsson || '')
          setDataCadastroTelebit(data.dataCadastroTelebit || '')
          setVencimentoAso(data.vencimentoAso || '')
          setVencimentoNr35(data.vencimentoNr35 || '')
          setVencimentoNr10(data.vencimentoNr10 || '')
          setUniforms(parseJsonList(data.uniforms, []))
          setEpis(parseJsonList(data.epis, []))
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId])

  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setSkillInput('')
  }

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const addUniform = () => {
    if (!uniformTipo.trim()) return
    setUniforms([...uniforms, { tipo: uniformTipo.trim(), tamanho: uniformTamanho.trim(), quantidade: uniformQtd }])
    setUniformTipo('')
    setUniformTamanho('')
    setUniformQtd('')
  }

  const addEpi = () => {
    if (!epiNome.trim()) return
    setEpis([...epis, { nome: epiNome.trim(), tamanho: epiTamanho.trim(), validade: epiValidade, quantidade: epiQtd }])
    setEpiNome('')
    setEpiTamanho('')
    setEpiValidade('')
    setEpiQtd('')
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setStep(0)
    setIsFreelancer(defaultType === 'freelancer')
    setNome('')
    setCompanyId(null)
    setDataAdmissao('')
    setFirstName('')
    setLastName('')
    setBirthDate('')
    setBio('')
    setEmail('')
    setHourlyRate('')
    setSkillInput('')
    setSkills([])
    setExperienceLevel('junior')
    setAvailability('available')
    setCpf('')
    setRg('')
    setOrgaoEmissor('')
    setNaturalidade('')
    setSexo('')
    setCnpj('')
    setTituloEleitor('')
    setCnh('')
    setCnhValidade('')
    setPis('')
    setRgArquivo('')
    setCarteiraArquivo('')
    setHabilitacaoArquivo('')
    setRgFile(null)
    setCarteiraFile(null)
    setHabilitacaoFile(null)
    setPhone('')
    setWhatsapp('')
    setContatoEmergenciaNome('')
    setContatoEmergenciaTelefone('')
    setContatoEmergenciaParentesco('')
    setEndereco('')
    setCidade('')
    setUf('')
    setCep('')
    setBanco('')
    setAgencia('')
    setConta('')
    setTipoConta('')
    setPix('')
    setTitular('')
    setUniforms([])
    setUniformTipo('')
    setUniformTamanho('')
    setUniformQtd('')
    setDataAso('')
    setDataNr06('')
    setDataNr35('')
    setDataNr10('')
    setDataNr75('')
    setDataNr01('')
    setDataIntegracao('')
    setDataListaFerramental('')
    setCracha('')
    setDataHs('')
    setDataLtw('')
    setDataCadastroNokia('')
    setDataCadastroEricsson('')
    setDataCadastroTelebit('')
    setVencimentoAso('')
    setVencimentoNr35('')
    setVencimentoNr10('')
    setEpis([])
    setEpiNome('')
    setEpiTamanho('')
    setEpiValidade('')
    setEpiQtd('')
    onClose()
  }

  const sectionTitle = (label: string) => (
    <Typography
      variant="subtitle2"
      sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, mt: 1 }}
    >
      {label}
    </Typography>
  )

  const renderMain = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          component="img"
          src={photoFile ? URL.createObjectURL(photoFile) : (foto || '/uploads/placeholder.png')}
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
            <input type="file" accept="image/*" hidden onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
          </Button>
        </Box>
      </Box>

      {sectionTitle('Identificação')}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Código" value={codigo} disabled placeholder="Gerado automaticamente" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Data de Cadastro"
            value={createdAt ? new Date(createdAt).toLocaleDateString('pt-BR') : ''}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Data de Atualização"
            value={updatedAt ? new Date(updatedAt).toLocaleDateString('pt-BR') : ''}
            disabled
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} required>
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
          </TextField>
        </Grid>
        {isFreelancer ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sm={6} md={6}>
            <TextField fullWidth label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label={isFreelancer ? 'Função' : 'Cargo'} value={funcao} onChange={(e) => setFuncao(e.target.value)} />
        </Grid>
        {!isFreelancer && (
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={isFreelancer ? 3 : 6}>
          <TextField
            fullWidth
            select
            label="Empresa"
            value={companyId ?? ''}
            onChange={(e) => setCompanyId(e.target.value ? Number(e.target.value) : null)}
            required
            disabled={!isMasterUser}
          >
            {availableCompanies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <TextField fullWidth label="Razão Social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Regional" value={regional} onChange={(e) => setRegional(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="UF" value={uf} onChange={(e) => setUf(e.target.value)} inputProps={{ maxLength: 2 }} />
        </Grid>
      </Grid>

      {sectionTitle('Contrato')}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth select label="Tipo de Contrato" value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)}>
            <MenuItem value="">Selecione</MenuItem>
            <MenuItem value="clt">CLT</MenuItem>
            <MenuItem value="pj">PJ</MenuItem>
            <MenuItem value="estagio">Estágio</MenuItem>
            <MenuItem value="terceirizado">Terceirizado</MenuItem>
            <MenuItem value="outro">Outro</MenuItem>
          </TextField>
        </Grid>
        {!isFreelancer && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Data de Admissão"
              type="date"
              value={dataAdmissao}
              onChange={(e) => setDataAdmissao(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}
        {isFreelancer && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Valor Hora" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Nível de Experiência" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} required>
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="mid">Pleno</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Disponibilidade" value={availability} onChange={(e) => setAvailability(e.target.value)} required>
                <MenuItem value="available">Disponível</MenuItem>
                <MenuItem value="busy">Ocupado</MenuItem>
                <MenuItem value="unavailable">Indisponível</MenuItem>
              </TextField>
            </Grid>
          </>
        )}
      </Grid>

      {isFreelancer && (
        <>
          {sectionTitle('Bio e Habilidades')}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Bio" multiline rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Habilidades"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Digite e pressione Enter"
              />
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {skills.map((s) => (
                  <Chip key={s} label={s} size="small" onDelete={() => handleRemoveSkill(s)} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )

  const renderDocs = () => (
    <Box>
      {sectionTitle('Identificação Pessoal')}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="RG" value={rg} onChange={(e) => setRg(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Órgão Emissor" value={orgaoEmissor} onChange={(e) => setOrgaoEmissor(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Data de Nascimento" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Naturalidade" value={naturalidade} onChange={(e) => setNaturalidade(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth select label="Sexo" value={sexo} onChange={(e) => setSexo(e.target.value)}>
            <MenuItem value="">Selecione</MenuItem>
            <MenuItem value="masculino">Masculino</MenuItem>
            <MenuItem value="feminino">Feminino</MenuItem>
            <MenuItem value="outro">Outro</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {sectionTitle('Vínculos Trabalhistas')}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="PIS" value={pis} onChange={(e) => setPis(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Título de Eleitor" value={tituloEleitor} onChange={(e) => setTituloEleitor(e.target.value)} />
        </Grid>
      </Grid>

      {sectionTitle('Habilitação')}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="CNH" value={cnh} onChange={(e) => setCnh(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Validade CNH" type="date" value={cnhValidade} onChange={(e) => setCnhValidade(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
      </Grid>

      {sectionTitle('Documentos Anexos')}
      <Grid container spacing={2}>
        {[
          { label: 'RG', arquivo: rgArquivo, file: rgFile, setFile: setRgFile, tipo: 'rg' },
          { label: 'Carteira de Trabalho', arquivo: carteiraArquivo, file: carteiraFile, setFile: setCarteiraFile, tipo: 'carteira' },
          { label: 'Habilitação', arquivo: habilitacaoArquivo, file: habilitacaoFile, setFile: setHabilitacaoFile, tipo: 'habilitacao' },
        ].map((item) => (
          <Grid item xs={12} sm={4} key={item.tipo}>
            <Box sx={{ border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 2, p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{item.label}</Typography>
              <Button size="small" variant="outlined" component="label">
                Anexar Arquivo
                <input type="file" hidden onChange={(e) => item.setFile(e.target.files?.[0] ?? null)} />
              </Button>
              {item.file && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {item.file.name}
                </Typography>
              )}
              {!item.file && item.arquivo && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  <a href={item.arquivo} target="_blank" rel="noreferrer">Ver anexo</a>
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  const renderContacts = () => (
    <Box>
      {sectionTitle('Contatos')}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField fullWidth label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="UF" value={uf} onChange={(e) => setUf(e.target.value)} inputProps={{ maxLength: 2 }} />
        </Grid>
      </Grid>

      {sectionTitle('Contato de Emergência')}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Nome" value={contatoEmergenciaNome} onChange={(e) => setContatoEmergenciaNome(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Telefone" value={contatoEmergenciaTelefone} onChange={(e) => setContatoEmergenciaTelefone(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth select label="Parentesco" value={contatoEmergenciaParentesco} onChange={(e) => setContatoEmergenciaParentesco(e.target.value)}>
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

  const renderBank = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Banco" value={banco} onChange={(e) => setBanco(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField fullWidth label="Agência" value={agencia} onChange={(e) => setAgencia(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField fullWidth label="Conta" value={conta} onChange={(e) => setConta(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth select label="Tipo de Conta" value={tipoConta} onChange={(e) => setTipoConta(e.target.value)}>
          <MenuItem value="">Selecione</MenuItem>
          <MenuItem value="corrente">Corrente</MenuItem>
          <MenuItem value="poupanca">Poupança</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Titular" value={titular} onChange={(e) => setTitular(e.target.value)} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="PIX" value={pix} onChange={(e) => setPix(e.target.value)} />
      </Grid>
    </Grid>
  )

  const dateField = (label: string, value: string, setter: (v: string) => void, cols = 3) => (
    <Grid item xs={12} sm={6} md={cols}>
      <TextField fullWidth label={label} type="date" value={value} onChange={(e) => setter(e.target.value)} InputLabelProps={{ shrink: true }} />
    </Grid>
  )

  const renderTrainings = () => (
    <Box>
      {sectionTitle('Saúde e Segurança')}
      <Grid container spacing={2}>
        {dateField('Data ASO', dataAso, setDataAso)}
        {dateField('Data NR06 Ficha de EPI', dataNr06, setDataNr06)}
        {dateField('Data NR35 Trabalho em Altura', dataNr35, setDataNr35)}
        {dateField('Data NR10 Eletricidade', dataNr10, setDataNr10)}
        {dateField('Data NR75 Primeiros Socorros', dataNr75, setDataNr75)}
        {dateField('Data NR01 Ordem de Serviço', dataNr01, setDataNr01)}
      </Grid>

      {sectionTitle('Integração')}
      <Grid container spacing={2}>
        {dateField('Data Integração', dataIntegracao, setDataIntegracao)}
        {dateField('Data Lista Ferramental', dataListaFerramental, setDataListaFerramental)}
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth select label="Crachá" value={cracha} onChange={(e) => setCracha(e.target.value)}>
            <MenuItem value="">Selecione</MenuItem>
            <MenuItem value="sim">Sim</MenuItem>
            <MenuItem value="nao">Não</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {sectionTitle('Nokia')}
      <Grid container spacing={2}>
        {dateField('Data H&S', dataHs, setDataHs)}
        {dateField('Data LTW', dataLtw, setDataLtw)}
        {dateField('Data Cadastro Nokia', dataCadastroNokia, setDataCadastroNokia)}
      </Grid>

      {sectionTitle('Outros Registros')}
      <Grid container spacing={2}>
        {dateField('Data Cadastro Ericsson', dataCadastroEricsson, setDataCadastroEricsson)}
        {dateField('Data Cadastro Telebit', dataCadastroTelebit, setDataCadastroTelebit)}
      </Grid>

      {sectionTitle('Vencimentos')}
      <Grid container spacing={2}>
        {dateField('ASO', vencimentoAso, setVencimentoAso)}
        {dateField('NR35', vencimentoNr35, setVencimentoNr35)}
        {dateField('NR10', vencimentoNr10, setVencimentoNr10)}
      </Grid>
    </Box>
  )

  const renderUniforms = () => (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
        <TextField fullWidth label="Tipo" value={uniformTipo} onChange={(e) => setUniformTipo(e.target.value)} placeholder="Ex.: Camiseta, Calça" />
        <TextField label="Tamanho" value={uniformTamanho} onChange={(e) => setUniformTamanho(e.target.value)} sx={{ width: 120 }} placeholder="P/M/G" />
        <TextField label="Qtd" type="number" value={uniformQtd} onChange={(e) => setUniformQtd(e.target.value)} sx={{ width: 80 }} />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addUniform} sx={{ height: 56 }}>
          Adicionar
        </Button>
      </Box>
      {uniforms.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum uniforme cadastrado.</Typography>
      ) : (
        uniforms.map((u, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {u.tipo} · {u.tamanho || '-'} · Qtd: {u.quantidade || 1}
            </Typography>
            <IconButton size="small" onClick={() => setUniforms(uniforms.filter((_, idx) => idx !== i))}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))
      )}
    </Box>
  )

  const renderEpi = () => (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
        <TextField fullWidth label="EPI" value={epiNome} onChange={(e) => setEpiNome(e.target.value)} placeholder="Ex.: Capacete, Luvas" />
        <TextField label="Tamanho" value={epiTamanho} onChange={(e) => setEpiTamanho(e.target.value)} sx={{ width: 110 }} />
        <TextField label="Validade" type="date" value={epiValidade} onChange={(e) => setEpiValidade(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
        <TextField label="Qtd" type="number" value={epiQtd} onChange={(e) => setEpiQtd(e.target.value)} sx={{ width: 70 }} />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addEpi} sx={{ height: 56 }}>
          Adicionar
        </Button>
      </Box>
      {epis.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum EPI cadastrado.</Typography>
      ) : (
        epis.map((ep, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {ep.nome} · {ep.tamanho || '-'}
              {ep.validade ? ` · Validade: ${ep.validade}` : ''} · Qtd: {ep.quantidade || 1}
            </Typography>
            <IconButton size="small" onClick={() => setEpis(epis.filter((_, idx) => idx !== i))}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))
      )}
    </Box>
  )

  const renderStep = () => {
    switch (activeSteps[step]) {
      case 'Dados Principais': return renderMain()
      case 'Documentação': return renderDocs()
      case 'Contatos': return renderContacts()
      case 'Bancários': return renderBank()
      case 'Treinamentos': return renderTrainings()
      case 'Uniformes': return renderUniforms()
      case 'EPI': return renderEpi()
      default: return null
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>
          {isEdit
            ? (isFreelancer ? 'Editar Freelancer' : 'Editar Colaborador')
            : (isFreelancer ? 'Novo Freelancer' : 'Novo Colaborador')}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={step} alternativeLabel nonLinear sx={{ mb: 3 }}>
            {activeSteps.map((label, index) => (
              <Step key={label}>
                <StepButton onClick={() => goTo(index)} disabled={loading}>{label}</StepButton>
              </Step>
            ))}
          </Stepper>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Divider sx={{ mb: 2 }} />
          {renderStep()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          {step > 0 && (
            <Button onClick={() => goTo(step - 1)} disabled={loading}>
              Voltar
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {step < activeSteps.length - 1 ? (
            <Button variant="contained" onClick={() => goTo(step + 1)} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar e Avançar'}
            </Button>
          ) : (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  )
}
