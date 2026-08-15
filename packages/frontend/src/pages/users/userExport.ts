import * as XLSX from 'xlsx'
import { User } from './usersTypes'
import { roleLabels } from '../settings/roleModules'

export function toExportRows(users: User[]) {
  return users.map((u) => ({
    Nome: u.name,
    Sobrenome: u.lastName || '',
    Email: u.email,
    Telefone: u.phone || '',
    Perfil: u.role ? (roleLabels[u.role] || u.role) : '',
    Empresa: u.role === 'master' ? '' : (u.companyName || ''),
    Status: u.status === 'active' ? 'Ativo' : 'Inativo',
    'Criado em': new Date(u.createdAt).toLocaleDateString('pt-BR'),
  }))
}

export function downloadUsersExcel(users: User[]): void {
  const sheet = XLSX.utils.json_to_sheet(toExportRows(users))
  sheet['!cols'] = [
    { wch: 22 },
    { wch: 22 },
    { wch: 30 },
    { wch: 16 },
    { wch: 14 },
    { wch: 24 },
    { wch: 10 },
    { wch: 12 },
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Usuários')
  XLSX.writeFile(workbook, `usuarios-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
