import * as XLSX from 'xlsx'

const EXAMPLE_NOME = 'ENLACE-EXEMPLO'

const TEMPLATE_ROWS = [
  {
    Nome: EXAMPLE_NOME,
    'Frequência': '23 GHz',
    Capacidade: '1 Gbps',
    'Operadora A': 'TIM',
    'Site ID A': 'SITE-001',
    'End ID A': 'END-001',
    'Endereço A': 'Av. Exemplo, 100',
    'Latitude A': -23.5505,
    'Longitude A': -46.6333,
    'Operadora B': 'CLARO',
    'Site ID B': 'SITE-002',
    'End ID B': 'END-002',
    'Endereço B': 'Rua Exemplo, 200',
    'Latitude B': -23.555,
    'Longitude B': -46.64,
    Observações: 'Exemplo de preenchimento',
    Status: 'ativo',
  },
  {
    Nome: '',
    'Frequência': '',
    Capacidade: '',
    'Operadora A': 'VIVO',
    'Site ID A': '',
    'End ID A': '',
    'Endereço A': '',
    'Latitude A': '',
    'Longitude A': '',
    'Operadora B': 'TIM',
    'Site ID B': '',
    'End ID B': '',
    'Endereço B': '',
    'Latitude B': '',
    'Longitude B': '',
    Observações: '',
    Status: 'ativo',
  },
]

export function downloadRadioLinkTemplate(): void {
  const sheet = XLSX.utils.json_to_sheet(TEMPLATE_ROWS, { skipHeader: false })
  sheet['!cols'] = [
    { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
    { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
    { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 10 },
  ]

  const border = {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } },
  }
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      if (!sheet[addr]) sheet[addr] = { t: 's', v: '' }
      sheet[addr].s = { border }
      if (r === 0) {
        sheet[addr].s = {
          ...sheet[addr].s,
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '1976D2' } },
          alignment: { horizontal: 'center' },
        }
      }
    }
  }
  sheet['!freeze'] = { xSplit: 0, ySplit: 1 }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Enlaces de Rádio')
  XLSX.writeFile(workbook, 'template-enlaces-de-radio.xlsx')
}

const str = (value: unknown) => (value != null ? String(value).trim() : '')

export function parseRadioLinkFile(buffer: ArrayBuffer) {
  const data = new Uint8Array(buffer)
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  const radioLinks = raw
    .map((row) => ({
      nome: str(row['Nome']),
      frequencia: str(row['Frequência']),
      capacidade: str(row['Capacidade']),
      operadoraA: str(row['Operadora A']),
      siteIdA: str(row['Site ID A']),
      endIdA: str(row['End ID A']),
      enderecoA: str(row['Endereço A']),
      latitudeA: row['Latitude A'],
      longitudeA: row['Longitude A'],
      operadoraB: str(row['Operadora B']),
      siteIdB: str(row['Site ID B']),
      endIdB: str(row['End ID B']),
      enderecoB: str(row['Endereço B']),
      latitudeB: row['Latitude B'],
      longitudeB: row['Longitude B'],
      observacoes: str(row['Observações']),
      status: str(row['Status']).toLowerCase(),
    }))
    .filter((link) => link.nome !== EXAMPLE_NOME)

  return radioLinks
}
