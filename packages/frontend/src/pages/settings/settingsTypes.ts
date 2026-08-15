export interface Settings {
  timezone: string
  language: string
  currency: string
}

export interface CompanyForm {
  nome: string
  cnpj: string
  telefone: string
  email: string
  endereco: string
  cidade: string
  uf: string
}

export interface SettingsField {
  key: string
  label: string
  type?: 'text' | 'email' | 'textarea' | 'select'
  options?: { value: string; label: string }[]
  placeholder?: string
  fullWidth?: boolean
}

export const timezoneOptions = [
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (UTC-3)' },
  { value: 'America/Manaus', label: 'America/Manaus (UTC-4)' },
  { value: 'America/Fortaleza', label: 'America/Fortaleza (UTC-3)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
  { value: 'Europe/Lisbon', label: 'Europe/Lisbon (UTC+1)' },
  { value: 'UTC', label: 'UTC' },
]

export const languageOptions = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
]

export const currencyOptions = [
  { value: 'BRL', label: 'Real (R$)' },
  { value: 'USD', label: 'Dólar (US$)' },
  { value: 'EUR', label: 'Euro (€)' },
]

export const settingsFields: SettingsField[] = [
  {
    key: 'timezone',
    label: 'Fuso horário',
    type: 'select',
    options: timezoneOptions,
  },
  {
    key: 'language',
    label: 'Idioma',
    type: 'select',
    options: languageOptions,
  },
  {
    key: 'currency',
    label: 'Moeda',
    type: 'select',
    options: currencyOptions,
  },
]

export const companyFields: SettingsField[] = [
  { key: 'nome', label: 'Nome da empresa', type: 'text', fullWidth: true },
  { key: 'cnpj', label: 'CNPJ', type: 'text' },
  { key: 'telefone', label: 'Telefone', type: 'text' },
  { key: 'email', label: 'E-mail de contato', type: 'email' },
  { key: 'endereco', label: 'Endereço', type: 'textarea', fullWidth: true },
  { key: 'cidade', label: 'Cidade', type: 'text' },
  { key: 'uf', label: 'UF', type: 'text' },
]

export const emptySettings: Settings = {
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  currency: 'BRL',
}

export const emptyCompany: CompanyForm = {
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  cidade: '',
  uf: '',
}
