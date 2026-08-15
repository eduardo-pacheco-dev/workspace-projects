import * as XLSX from 'xlsx'
import { Client, Responsavel } from './clientsTypes'

export function downloadClientsExcel(clients: Client[]): void {
  const rows = clients.map((c) => ({
    Nome: c.nome,
    CNPJ: c.documento || '',
    Email: c.email || '',
    Telefone: c.telefone || '',
    Endereço: c.endereco || '',
    Cidade: c.cidade || '',
    UF: c.uf || '',
    Observações: c.observacoes || '',
    Status: c.status === 'ativo' ? 'Ativo' : 'Inativo',
  }))

  const sheet = XLSX.utils.json_to_sheet(rows)
  sheet['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 30 },
    { wch: 18 },
    { wch: 34 },
    { wch: 18 },
    { wch: 6 },
    { wch: 34 },
    { wch: 10 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Clientes')
  XLSX.writeFile(workbook, `clientes-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function downloadResponsaveisExcel(responsaveis: Responsavel[], clientName: string): void {
  const rows = responsaveis.map((r) => ({
    Nome: r.nome,
    Sobrenome: r.sobrenome,
    Email: r.email || '',
    Telefone: r.telefone || '',
    Função: r.funcao || '',
  }))

  const sheet = XLSX.utils.json_to_sheet(rows)
  sheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 16 }, { wch: 24 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Responsáveis')
  const safeName = clientName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  XLSX.writeFile(workbook, `responsaveis-${safeName}.xlsx`)
}
