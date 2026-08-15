export interface Uniform {
  tipo: string
  tamanho: string
  quantidade: string
}

export interface Epi {
  nome: string
  tamanho: string
  validade: string
  quantidade: string
}

export interface FreelancerFormState {
  isFreelancer: boolean
  companyId: number | null
  nome: string
  dataAdmissao: string
  firstName: string
  lastName: string
  birthDate: string
  bio: string
  skillInput: string
  skills: string[]
  experienceLevel: string
  availability: string
  hourlyRate: string
  codigo: string
  razaoSocial: string
  tipoContrato: string
  regional: string
  funcao: string
  status: string
  foto: string
  photoFile: File | null
  createdAt: string
  updatedAt: string
  cpf: string
  rg: string
  orgaoEmissor: string
  naturalidade: string
  sexo: string
  cnpj: string
  tituloEleitor: string
  cnh: string
  cnhValidade: string
  pis: string
  rgArquivo: string
  carteiraArquivo: string
  habilitacaoArquivo: string
  nr10Arquivo: string
  nr35Arquivo: string
  asoArquivo: string
  epiArquivo: string
  ordemServicoArquivo: string
  contratoArquivo: string
  rgFile: File | null
  carteiraFile: File | null
  habilitacaoFile: File | null
  nr10File: File | null
  nr35File: File | null
  asoFile: File | null
  epiFile: File | null
  ordemServicoFile: File | null
  contratoFile: File | null
  email: string
  phone: string
  whatsapp: string
  contatoEmergenciaNome: string
  contatoEmergenciaTelefone: string
  contatoEmergenciaParentesco: string
  endereco: string
  cidade: string
  uf: string
  cep: string
  banco: string
  agencia: string
  conta: string
  tipoConta: string
  pix: string
  titular: string
  dataAso: string
  dataNr06: string
  dataNr35: string
  dataNr10: string
  dataNr75: string
  dataNr01: string
  dataIntegracao: string
  dataListaFerramental: string
  cracha: string
  dataHs: string
  dataLtw: string
  dataCadastroNokia: string
  dataCadastroEricsson: string
  dataCadastroTelebit: string
  vencimentoAso: string
  vencimentoNr35: string
  vencimentoNr10: string
  uniforms: Uniform[]
  uniformTipo: string
  uniformTamanho: string
  uniformQtd: string
  epis: Epi[]
  epiNome: string
  epiTamanho: string
  epiValidade: string
  epiQtd: string
}

export const initialFreelancerForm = (isFreelancer: boolean): FreelancerFormState => ({
  isFreelancer,
  companyId: null,
  nome: '',
  dataAdmissao: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  bio: '',
  skillInput: '',
  skills: [],
  experienceLevel: 'junior',
  availability: 'available',
  hourlyRate: '',
  codigo: '',
  razaoSocial: '',
  tipoContrato: '',
  regional: '',
  funcao: '',
  status: 'ativo',
  foto: '',
  photoFile: null,
  createdAt: '',
  updatedAt: '',
  cpf: '',
  rg: '',
  orgaoEmissor: '',
  naturalidade: '',
  sexo: '',
  cnpj: '',
  tituloEleitor: '',
  cnh: '',
  cnhValidade: '',
  pis: '',
  rgArquivo: '',
  carteiraArquivo: '',
  habilitacaoArquivo: '',
  nr10Arquivo: '',
  nr35Arquivo: '',
  asoArquivo: '',
  epiArquivo: '',
  ordemServicoArquivo: '',
  contratoArquivo: '',
  rgFile: null,
  carteiraFile: null,
  habilitacaoFile: null,
  nr10File: null,
  nr35File: null,
  asoFile: null,
  epiFile: null,
  ordemServicoFile: null,
  contratoFile: null,
  email: '',
  phone: '',
  whatsapp: '',
  contatoEmergenciaNome: '',
  contatoEmergenciaTelefone: '',
  contatoEmergenciaParentesco: '',
  endereco: '',
  cidade: '',
  uf: '',
  cep: '',
  banco: '',
  agencia: '',
  conta: '',
  tipoConta: '',
  pix: '',
  titular: '',
  dataAso: '',
  dataNr06: '',
  dataNr35: '',
  dataNr10: '',
  dataNr75: '',
  dataNr01: '',
  dataIntegracao: '',
  dataListaFerramental: '',
  cracha: '',
  dataHs: '',
  dataLtw: '',
  dataCadastroNokia: '',
  dataCadastroEricsson: '',
  dataCadastroTelebit: '',
  vencimentoAso: '',
  vencimentoNr35: '',
  vencimentoNr10: '',
  uniforms: [],
  uniformTipo: '',
  uniformTamanho: '',
  uniformQtd: '',
  epis: [],
  epiNome: '',
  epiTamanho: '',
  epiValidade: '',
  epiQtd: '',
})

export function parseJsonList(value: string | null | undefined, fallback: unknown[]): unknown[] {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export type UpdateField = <K extends keyof FreelancerFormState>(key: K, value: FreelancerFormState[K]) => void

export function buildFreelancerPayload(form: FreelancerFormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    isFreelancer: form.isFreelancer,
    companyId: form.companyId,
    status: form.status,
    funcao: form.funcao,
    razaoSocial: form.razaoSocial,
    tipoContrato: form.tipoContrato,
    regional: form.regional,
    cpf: form.cpf,
    rg: form.rg,
    orgaoEmissor: form.orgaoEmissor,
    naturalidade: form.naturalidade,
    sexo: form.sexo,
    cnpj: form.cnpj,
    tituloEleitor: form.tituloEleitor,
    cnh: form.cnh,
    cnhValidade: form.cnhValidade,
    pis: form.pis,
    rgArquivo: form.rgArquivo,
    carteiraArquivo: form.carteiraArquivo,
    habilitacaoArquivo: form.habilitacaoArquivo,
    phone: form.phone,
    whatsapp: form.whatsapp,
    contatoEmergenciaNome: form.contatoEmergenciaNome,
    contatoEmergenciaTelefone: form.contatoEmergenciaTelefone,
    contatoEmergenciaParentesco: form.contatoEmergenciaParentesco,
    endereco: form.endereco,
    cidade: form.cidade,
    uf: form.uf,
    cep: form.cep,
    banco: form.banco,
    agencia: form.agencia,
    conta: form.conta,
    tipoConta: form.tipoConta,
    pix: form.pix,
    titular: form.titular,
    dataAso: form.dataAso,
    dataNr06: form.dataNr06,
    dataNr35: form.dataNr35,
    dataNr10: form.dataNr10,
    dataNr75: form.dataNr75,
    dataNr01: form.dataNr01,
    dataIntegracao: form.dataIntegracao,
    dataListaFerramental: form.dataListaFerramental,
    cracha: form.cracha || undefined,
    dataHs: form.dataHs,
    dataLtw: form.dataLtw,
    dataCadastroNokia: form.dataCadastroNokia,
    dataCadastroEricsson: form.dataCadastroEricsson,
    dataCadastroTelebit: form.dataCadastroTelebit,
    vencimentoAso: form.vencimentoAso,
    vencimentoNr35: form.vencimentoNr35,
    vencimentoNr10: form.vencimentoNr10,
    uniforms: JSON.stringify(form.uniforms),
    epis: JSON.stringify(form.epis),
    birthDate: form.birthDate,
  }
  if (form.email) payload.email = form.email
  if (form.isFreelancer) {
    payload.firstName = form.firstName
    payload.lastName = form.lastName
    payload.bio = form.bio
    payload.hourlyRate = form.hourlyRate ? Number(form.hourlyRate) : undefined
    payload.skills = form.skills.join(', ')
    payload.experienceLevel = form.experienceLevel
    payload.availability = form.availability
  } else {
    payload.nome = form.nome
    payload.cargo = form.funcao
    payload.dataAdmissao = form.dataAdmissao
  }
  return payload
}
