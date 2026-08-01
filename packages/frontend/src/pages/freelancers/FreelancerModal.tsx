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

interface FreelancerModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

interface Training {
  nome: string
  validade: string
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

const parseJsonList = (value: string | null | undefined, fallback: any[]): any[] => {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export default function FreelancerModal({ open, editId, onClose, onSaved }: FreelancerModalProps) {
  const isEdit = Boolean(editId)
  const [step, setStep] = useState(0)

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
  const [cnh, setCnh] = useState('')
  const [cnhValidade, setCnhValidade] = useState('')
  const [pis, setPis] = useState('')

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
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

  const [trainings, setTrainings] = useState<Training[]>([])
  const [trainingNome, setTrainingNome] = useState('')
  const [trainingValidade, setTrainingValidade] = useState('')

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

  const buildPayload = (): any => ({
    firstName,
    lastName,
    birthDate,
    bio,
    email,
    hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
    skills: skills.join(', '),
    experienceLevel,
    availability,
    razaoSocial,
    tipoContrato,
    regional,
    funcao,
    status,
    cpf,
    rg,
    cnh,
    cnhValidade,
    pis,
    phone,
    whatsapp,
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
    trainings: JSON.stringify(trainings),
    uniforms: JSON.stringify(uniforms),
    epis: JSON.stringify(epis),
  })

  const uploadPhoto = async (id: number) => {
    if (!photoFile) return
    const form = new FormData()
    form.append('file', photoFile)
    const res = await api.post(`/freelancers/${id}/photo`, form)
    setFoto(res.data.foto || '')
  }

  const saveCurrent = async (): Promise<number> => {
    setError('')
    setLoading(true)
    try {
      const payload = buildPayload()
      if (savedId != null) {
        const res = await api.patch(`/freelancers/${savedId}`, payload)
        await uploadPhoto(savedId)
        setCreatedAt(res.data.createdAt || createdAt)
        setUpdatedAt(res.data.updatedAt || updatedAt)
        return savedId
      }
      const res = await api.post('/freelancers', payload)
      const id = res.data.id
      setSavedId(id)
      setCodigo(res.data.codigo || '')
      setCreatedAt(res.data.createdAt || '')
      setUpdatedAt(res.data.updatedAt || '')
      await uploadPhoto(id)
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
    }
    if (open && editId) {
      api.get(`/freelancers/${editId}`)
        .then((res) => {
          const data = res.data
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
          setFuncao(data.funcao || '')
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
          setCnh(data.cnh || '')
          setCnhValidade(data.cnhValidade || '')
          setPis(data.pis || '')

          setPhone(data.phone || '')
          setWhatsapp(data.whatsapp || '')
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

          setTrainings(parseJsonList(data.trainings, []))
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

  const addTraining = () => {
    if (!trainingNome.trim()) return
    setTrainings([...trainings, { nome: trainingNome.trim(), validade: trainingValidade }])
    setTrainingNome('')
    setTrainingValidade('')
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
    setCnh('')
    setCnhValidade('')
    setPis('')
    setPhone('')
    setWhatsapp('')
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
    setTrainings([])
    setTrainingNome('')
    setTrainingValidade('')
    setUniforms([])
    setUniformTipo('')
    setUniformTamanho('')
    setUniformQtd('')
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
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Sobrenome" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Função" value={funcao} onChange={(e) => setFuncao(e.target.value)} />
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
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Data de Nascimento" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={4}>
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
      </Grid>

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
    </Box>
  )

  const renderDocs = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="RG" value={rg} onChange={(e) => setRg(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="CNH" value={cnh} onChange={(e) => setCnh(e.target.value)} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="Validade CNH" type="date" value={cnhValidade} onChange={(e) => setCnhValidade(e.target.value)} InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth label="PIS/PASEP" value={pis} onChange={(e) => setPis(e.target.value)} />
      </Grid>
    </Grid>
  )

  const renderContacts = () => (
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

  const renderTrainings = () => (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
        <TextField
          fullWidth
          label="Treinamento"
          value={trainingNome}
          onChange={(e) => setTrainingNome(e.target.value)}
          placeholder="Ex.: Trabalho em Altura"
        />
        <TextField
          label="Validade"
          type="date"
          value={trainingValidade}
          onChange={(e) => setTrainingValidade(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 170 }}
        />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addTraining} sx={{ height: 56 }}>
          Adicionar
        </Button>
      </Box>
      {trainings.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum treinamento cadastrado.</Typography>
      ) : (
        trainings.map((t, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {t.nome}
              {t.validade ? ` · Validade: ${t.validade}` : ''}
            </Typography>
            <IconButton size="small" onClick={() => setTrainings(trainings.filter((_, idx) => idx !== i))}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))
      )}
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
    switch (step) {
      case 0: return renderMain()
      case 1: return renderDocs()
      case 2: return renderContacts()
      case 3: return renderBank()
      case 4: return renderTrainings()
      case 5: return renderUniforms()
      case 6: return renderEpi()
      default: return null
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Freelancer' : 'Novo Freelancer'}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={step} alternativeLabel nonLinear sx={{ mb: 3 }}>
            {steps.map((label, index) => (
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
          {step < steps.length - 1 ? (
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
