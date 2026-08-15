import * as XLSX from 'xlsx'
import { Lpu } from './lpuTypes'

function downloadSheet(rows: Record<string, unknown>[], columns: { wch: number }[], filename: string): void {
  const sheet = XLSX.utils.json_to_sheet(rows)
  sheet['!cols'] = columns
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'LPUs')
  XLSX.writeFile(workbook, filename)
}

export function downloadLpusExcel(lpus: Lpu[]): void {
  const rows = lpus.map((lpu) => ({
    Freelancer: lpu.freelancer?.nome || '',
    Nome: lpu.nome,
    'Descrição': lpu.descricao || '',
    Valor: lpu.valor ?? '',
    Data: lpu.data || '',
    Status: lpu.status === 'ativo' ? 'Ativo' : 'Inativo',
  }))
  downloadSheet(
    rows,
    [{ wch: 28 }, { wch: 30 }, { wch: 40 }, { wch: 14 }, { wch: 14 }, { wch: 10 }],
    `lpus-${new Date().toISOString().slice(0, 10)}.xlsx`,
  )
}

export function downloadFreelancerLpusExcel(lpus: Lpu[], filename: string): void {
  const rows = lpus.map((lpu) => ({
    Nome: lpu.nome,
    'Descrição': lpu.descricao || '',
    Valor: lpu.valor ?? '',
    Data: lpu.data || '',
    Status: lpu.status === 'ativo' ? 'Ativo' : 'Inativo',
  }))
  downloadSheet(
    rows,
    [{ wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 10 }],
    filename,
  )
}
