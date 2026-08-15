import { useState, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  CircularProgress,
  Stepper,
  Step,
  StepButton,
  Divider,
} from '@mui/material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import MainStep from '../../components/freelancers/steps/MainStep'
import DocumentsStep from '../../components/freelancers/steps/DocumentsStep'
import ContactsStep from '../../components/freelancers/steps/ContactsStep'
import BankStep from '../../components/freelancers/steps/BankStep'
import TrainingsStep from '../../components/freelancers/steps/TrainingsStep'
import UniformsStep from '../../components/freelancers/steps/UniformsStep'
import EpiStep from '../../components/freelancers/steps/EpiStep'
import {
  FreelancerFormState,
  initialFreelancerForm,
  parseJsonList,
  buildFreelancerPayload,
} from './freelancerTypes'

interface FreelancerModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
  defaultType?: 'freelancer' | 'colaborador'
}

const steps = ['Dados Principais', 'Documentação', 'Contatos', 'Bancários', 'Treinamentos', 'Uniformes', 'EPI']
const collaboratorSteps = ['Dados Principais', 'Contatos']

export default function FreelancerModal({ open, editId, onClose, onSaved, defaultType = 'freelancer' }: FreelancerModalProps) {
  const isEdit = Boolean(editId)
  const { user: currentUser } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FreelancerFormState>(() => initialFreelancerForm(defaultType === 'freelancer'))
  const [companies, setCompanies] = useState<{ id: number; nome: string }[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)

  const activeSteps = form.isFreelancer ? steps : collaboratorSteps
  const isMasterUser = currentUser?.role === 'master'
  const availableCompanies = isMasterUser
    ? companies
    : currentUser?.companyId != null
      ? [{ id: currentUser.companyId, nome: currentUser.companyName || '' }]
      : []

  const updateField = <K extends keyof FreelancerFormState>(key: K, value: FreelancerFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

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
      if (!editId) updateField('companyId', currentUser.companyId)
    }
  }, [open, isMasterUser, editId, currentUser?.companyId, currentUser?.companyName])

  useEffect(() => {
    if (open) {
      setSavedId(editId ?? null)
      setForm(initialFreelancerForm(defaultType === 'freelancer'))
    }
    if (open && editId) {
      api.get(`/collaborators/${editId}`)
        .then((res) => {
          const data = res.data
          setForm((prev) => ({
            ...prev,
            isFreelancer: Boolean(data.isFreelancer),
            companyId: data.companyId ?? null,
            dataAdmissao: data.dataAdmissao || '',
            nome: data.nome && !data.firstName ? data.nome : '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            birthDate: data.birthDate || '',
            bio: data.bio || '',
            email: data.email || '',
            hourlyRate: data.hourlyRate != null ? String(data.hourlyRate) : '',
            codigo: data.codigo || '',
            razaoSocial: data.razaoSocial || '',
            tipoContrato: data.tipoContrato || '',
            regional: data.regional || '',
            funcao: data.funcao || data.cargo || '',
            status: data.status || 'ativo',
            foto: data.foto || '',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            skills: typeof data.skills === 'string'
              ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
              : data.skills || [],
            experienceLevel: data.experienceLevel || 'junior',
            availability: data.availability || 'available',
            cpf: data.cpf || '',
            rg: data.rg || '',
            orgaoEmissor: data.orgaoEmissor || '',
            naturalidade: data.naturalidade || '',
            sexo: data.sexo || '',
            cnpj: data.cnpj || '',
            tituloEleitor: data.tituloEleitor || '',
            cnh: data.cnh || '',
            cnhValidade: data.cnhValidade || '',
            pis: data.pis || '',
            rgArquivo: data.rgArquivo || '',
            carteiraArquivo: data.carteiraArquivo || '',
            habilitacaoArquivo: data.habilitacaoArquivo || '',
            nr10Arquivo: data.nr10Arquivo || '',
            nr35Arquivo: data.nr35Arquivo || '',
            asoArquivo: data.asoArquivo || '',
            epiArquivo: data.epiArquivo || '',
            ordemServicoArquivo: data.ordemServicoArquivo || '',
            contratoArquivo: data.contratoArquivo || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            contatoEmergenciaNome: data.contatoEmergenciaNome || '',
            contatoEmergenciaTelefone: data.contatoEmergenciaTelefone || '',
            contatoEmergenciaParentesco: data.contatoEmergenciaParentesco || '',
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            uf: data.uf || '',
            cep: data.cep || '',
            banco: data.banco || '',
            agencia: data.agencia || '',
            conta: data.conta || '',
            tipoConta: data.tipoConta || '',
            pix: data.pix || '',
            titular: data.titular || '',
            dataAso: data.dataAso || '',
            dataNr06: data.dataNr06 || '',
            dataNr35: data.dataNr35 || '',
            dataNr10: data.dataNr10 || '',
            dataNr75: data.dataNr75 || '',
            dataNr01: data.dataNr01 || '',
            dataIntegracao: data.dataIntegracao || '',
            dataListaFerramental: data.dataListaFerramental || '',
            cracha: data.cracha || '',
            dataHs: data.dataHs || '',
            dataLtw: data.dataLtw || '',
            dataCadastroNokia: data.dataCadastroNokia || '',
            dataCadastroEricsson: data.dataCadastroEricsson || '',
            dataCadastroTelebit: data.dataCadastroTelebit || '',
            vencimentoAso: data.vencimentoAso || '',
            vencimentoNr35: data.vencimentoNr35 || '',
            vencimentoNr10: data.vencimentoNr10 || '',
            uniforms: parseJsonList(data.uniforms, []) as typeof prev.uniforms,
            epis: parseJsonList(data.epis, []) as typeof prev.epis,
          }))
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
    }
  }, [open, editId, defaultType])

  const uploadPhoto = async (id: number) => {
    if (!form.photoFile) return
    const photoForm = new FormData()
    photoForm.append('file', form.photoFile)
    const res = await api.post(`/collaborators/${id}/photo`, photoForm)
    updateField('foto', res.data.foto || '')
  }

  const uploadDocument = async (
    id: number,
    tipo: 'rg' | 'carteira' | 'habilitacao' | 'nr10' | 'nr35' | 'aso' | 'epi' | 'ordemServico' | 'contrato',
  ) => {
    const fileKey = `${tipo}File` as keyof FreelancerFormState
    const file = form[fileKey] as File | null
    if (!file) return
    const docForm = new FormData()
    docForm.append('file', file)
    const res = await api.post(`/collaborators/${id}/document/${tipo}`, docForm)
    const arquivoKey = `${tipo}Arquivo` as keyof FreelancerFormState
    updateField(arquivoKey, res.data[arquivoKey] || '')
  }

  const saveCurrent = async (): Promise<number> => {
    setError('')
    setLoading(true)
    try {
      const payload = buildFreelancerPayload(form)
      if (savedId != null) {
        const res = await api.patch(`/collaborators/${savedId}`, payload)
        await uploadPhoto(savedId)
        await uploadDocuments(savedId)
        updateField('createdAt', res.data.createdAt || form.createdAt)
        updateField('updatedAt', res.data.updatedAt || form.updatedAt)
        return savedId
      }
      const res = await api.post('/collaborators', payload)
      const id = res.data.id
      setSavedId(id)
      updateField('codigo', res.data.codigo || '')
      updateField('createdAt', res.data.createdAt || '')
      updateField('updatedAt', res.data.updatedAt || '')
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

  const uploadDocuments = async (id: number) => {
    await uploadDocument(id, 'rg')
    await uploadDocument(id, 'carteira')
    await uploadDocument(id, 'habilitacao')
    await uploadDocument(id, 'nr10')
    await uploadDocument(id, 'nr35')
    await uploadDocument(id, 'aso')
    await uploadDocument(id, 'epi')
    await uploadDocument(id, 'ordemServico')
    await uploadDocument(id, 'contrato')
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

  const handleClose = () => {
    if (loading) return
    setError('')
    setStep(0)
    setForm(initialFreelancerForm(defaultType === 'freelancer'))
    setSavedId(null)
    onClose()
  }

  const renderStep = () => {
    switch (activeSteps[step]) {
      case 'Dados Principais':
        return <MainStep form={form} updateField={updateField} availableCompanies={availableCompanies} isMasterUser={isMasterUser} />
      case 'Documentação':
        return <DocumentsStep form={form} updateField={updateField} />
      case 'Contatos':
        return <ContactsStep form={form} updateField={updateField} />
      case 'Bancários':
        return <BankStep form={form} updateField={updateField} />
      case 'Treinamentos':
        return <TrainingsStep form={form} updateField={updateField} />
      case 'Uniformes':
        return <UniformsStep form={form} updateField={updateField} />
      case 'EPI':
        return <EpiStep form={form} updateField={updateField} />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>
          {isEdit
            ? (form.isFreelancer ? 'Editar Freelancer' : 'Editar Colaborador')
            : (form.isFreelancer ? 'Novo Freelancer' : 'Novo Colaborador')}
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
