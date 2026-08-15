import * as XLSX from 'xlsx'
import { Collaborator } from './collaboratorsTypes'

export function downloadCollaboratorsExcel(collaborators: Collaborator[]): void {
  const rows = collaborators.map((c) => ({
    Código: c.codigo || '',
    Nome: c.nome,
    CPF: c.cpf || '',
    Cargo: c.cargo || '',
    Email: c.email || '',
    Telefone: c.telefone || '',
    Tipo: c.isFreelancer ? 'Freelancer' : 'Colaborador',
    Status: c.status === 'ativo' ? 'Ativo' : 'Inativo',
    Empresa: c.company?.nome || '',
  }))

  const sheet = XLSX.utils.json_to_sheet(rows)
  sheet['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 18 },
    { wch: 24 },
    { wch: 30 },
    { wch: 18 },
    { wch: 14 },
    { wch: 10 },
    { wch: 28 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Colaboradores')
  XLSX.writeFile(workbook, `colaboradores-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
