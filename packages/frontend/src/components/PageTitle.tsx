import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const APP_TITLE = 'Sistema de Telecomunicações'

const ROUTE_TITLES: { pattern: string[]; title: string }[] = [
  { pattern: ['signin'], title: 'Entrar' },
  { pattern: ['signup'], title: 'Criar Conta' },
  { pattern: ['forgot-password'], title: 'Recuperar Senha' },
  { pattern: ['reset-password'], title: 'Redefinir Senha' },
  { pattern: ['activation-pending'], title: 'Aguardando Ativação' },
  { pattern: ['500'], title: 'Erro Interno' },
  { pattern: ['401'], title: 'Não Autorizado' },
  { pattern: [], title: 'Dashboard' },
  { pattern: ['users'], title: 'Usuários' },
  { pattern: ['service-orders'], title: 'Ordens de Serviço' },
  { pattern: ['service-orders', ':id'], title: 'Ordem de Serviço' },
  { pattern: ['collaborators'], title: 'Colaboradores' },
  { pattern: ['collaborators', ':id'], title: 'Colaborador' },
  { pattern: ['jobs'], title: 'Jobs' },
  { pattern: ['jobs', ':id'], title: 'Job' },
  { pattern: ['proposals'], title: 'Propostas' },
  { pattern: ['proposals', 'new'], title: 'Nova Proposta' },
  { pattern: ['proposals', ':id'], title: 'Proposta' },
  { pattern: ['proposals', ':id', 'edit'], title: 'Editar Proposta' },
  { pattern: ['contracts'], title: 'Contratos' },
  { pattern: ['contracts', 'new'], title: 'Novo Contrato' },
  { pattern: ['contracts', ':id'], title: 'Contrato' },
  { pattern: ['contracts', ':id', 'edit'], title: 'Editar Contrato' },
  { pattern: ['finance'], title: 'Financeiro' },
  { pattern: ['finance', 'accounts', ':id'], title: 'Conta' },
  { pattern: ['finance', 'cards', ':id'], title: 'Cartão' },
  { pattern: ['stations'], title: 'Estações (ERBS)' },
  { pattern: ['stations', ':id'], title: 'Estação (ERBS)' },
  { pattern: ['radio-links'], title: 'Enlaces de Rádio' },
  { pattern: ['radio-links', ':id'], title: 'Enlace de Rádio' },
  { pattern: ['projects'], title: 'Projetos' },
  { pattern: ['projects', ':id'], title: 'Projeto' },
  { pattern: ['clients'], title: 'Clientes' },
  { pattern: ['clients', ':id'], title: 'Cliente' },
  { pattern: ['schedule'], title: 'Agenda' },
  { pattern: ['tasks'], title: 'Tarefas' },
  { pattern: ['tasks', ':id'], title: 'Tarefa' },
  { pattern: ['pdca'], title: 'PDCA' },
  { pattern: ['pdca', ':id'], title: 'PDCA' },
  { pattern: ['ms-project'], title: 'Cronograma (MS Project)' },
  { pattern: ['ms-project', ':id'], title: 'Plano (MS Project)' },
  { pattern: ['settings'], title: 'Configurações' },
  { pattern: ['companies'], title: 'Empresas' },
  { pattern: ['companies', ':id'], title: 'Empresa' },
  { pattern: ['profile'], title: 'Meu Perfil' },
  { pattern: ['lpu'], title: 'LPUs' },
  { pattern: ['teams'], title: 'Equipes' },
]

function resolveTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  let best: { pattern: string[]; title: string } | undefined
  for (const entry of ROUTE_TITLES) {
    if (entry.pattern.length > segments.length) continue
    const matches = entry.pattern.every((seg, i) => seg === ':id' || seg === segments[i])
    if (matches && (!best || entry.pattern.length > best.pattern.length)) best = entry
  }
  return best ? best.title : 'Página não encontrada'
}

export default function PageTitle() {
  const location = useLocation()
  useEffect(() => {
    document.title = `${resolveTitle(location.pathname)} | ${APP_TITLE}`
  }, [location.pathname])
  return null
}
