import * as XLSX from 'xlsx'

interface ImportPayload {
  siteId: string
  endId: string
  elementType: string
  technology: string
  areaHolder: string
  infraContractType: string
  infraHolder: string
  infraType: string
  evType: string
  evSupplier: string
  mobileCarrier: string
  status: string
  address: string
  regional: string
  latitude: unknown
  longitude: unknown
  towerType: string
  nominalAev: unknown
  groundArea: unknown
  structureHeight: unknown
  stationId: string
  notes: string
}

const TEMPLATE_ROWS = [
  {
    'Site ID': 'SITE-001',
    'End ID': 'END-001',
    'Tipo de elemento': 'Macro',
    Tecnologia: '4G',
    'Detentor da Área': 'Detentora A',
    'Tipo de contrato Infra': 'Locação',
    'Detentor de Infra': 'Infra B',
    'Tipo de Infra': 'Torre',
    'Tipo de EV': 'EV-01',
    'Fornecedor de EV': 'Fornecedor X',
    Operadora: 'TIM',
    Status: 'ativo',
    Endereço: 'Av. Exemplo, 100',
    Regional: 'Norte',
    Latitude: -23.5505,
    Longitude: -46.6333,
    'Tipo da torre': 'Torre treliçada',
    'AEV Nominal': 120,
    'Área de solo': 45.5,
    'Altura da estrutura': 60,
    Station_id: 'ST-001',
    Observações: 'Exemplo de preenchimento',
  },
  {
    'Site ID': '',
    'End ID': '',
    'Tipo de elemento': '',
    Tecnologia: '',
    'Detentor da Área': '',
    'Tipo de contrato Infra': '',
    'Detentor de Infra': '',
    'Tipo de Infra': '',
    'Tipo de EV': '',
    'Fornecedor de EV': '',
    Operadora: 'CLARO',
    Status: 'ativo',
    Endereço: '',
    Regional: '',
    Latitude: '',
    Longitude: '',
    'Tipo da torre': '',
    'AEV Nominal': '',
    'Área de solo': '',
    'Altura da estrutura': '',
    Station_id: '',
    Observações: '',
  },
]

export function downloadStationTemplate(): void {
  const sheet = XLSX.utils.json_to_sheet(TEMPLATE_ROWS, { skipHeader: false })
  sheet['!cols'] = [
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 10 },
    { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 12 },
    { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 40 },
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
  XLSX.utils.book_append_sheet(workbook, sheet, 'Estações')
  XLSX.writeFile(workbook, 'template-estacoes.xlsx')
}

export function parseStationFile(buffer: ArrayBuffer): ImportPayload[] {
  const data = new Uint8Array(buffer)
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  const stations = raw
    .map((row) => ({
      siteId: String(row['Site ID'] ?? '').trim(),
      endId: String(row['End ID'] ?? '').trim(),
      elementType: row['Tipo de elemento'] != null ? String(row['Tipo de elemento']).trim() : '',
      technology: row['Tecnologia'] != null ? String(row['Tecnologia']).trim() : '',
      areaHolder: row['Detentor da Área'] != null ? String(row['Detentor da Área']).trim() : '',
      infraContractType: row['Tipo de contrato Infra'] != null ? String(row['Tipo de contrato Infra']).trim() : '',
      infraHolder: row['Detentor de Infra'] != null ? String(row['Detentor de Infra']).trim() : '',
      infraType: row['Tipo de Infra'] != null ? String(row['Tipo de Infra']).trim() : '',
      evType: row['Tipo de EV'] != null ? String(row['Tipo de EV']).trim() : '',
      evSupplier: row['Fornecedor de EV'] != null ? String(row['Fornecedor de EV']).trim() : '',
      mobileCarrier: row['Operadora'] != null ? String(row['Operadora']).trim() : '',
      status: String(row['Status'] ?? '').trim().toLowerCase(),
      address: row['Endereço'] != null ? String(row['Endereço']).trim() : '',
      regional: row['Regional'] != null ? String(row['Regional']).trim() : '',
      latitude: row['Latitude'],
      longitude: row['Longitude'],
      towerType: row['Tipo da torre'] != null ? String(row['Tipo da torre']).trim() : '',
      nominalAev: row['AEV Nominal'],
      groundArea: row['Área de solo'],
      structureHeight: row['Altura da estrutura'],
      stationId: row['Station_id'] != null ? String(row['Station_id']).trim() : '',
      notes: row['Observações'] != null ? String(row['Observações']).trim() : '',
    }))
    .filter((station) => !(station.siteId === 'SITE-001' && station.endId === 'END-001'))

  return stations
}
