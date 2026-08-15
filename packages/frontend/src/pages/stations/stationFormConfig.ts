export interface StationFieldConfig {
  name: string
  label: string
  size?: number
  required?: boolean
  type?: 'text' | 'number'
  select?: string[]
  multiline?: boolean
  rows?: number
  visible?: (form: StationFormState) => boolean
}

export interface StationFormState {
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
  address: string
  regional: string
  latitude: string
  longitude: string
  mobileCarrier: string
  towerType: string
  nominalAev: string
  groundArea: string
  structureHeight: string
  stationId: string
  notes: string
  status: string
}

export const initialStationForm: StationFormState = {
  siteId: '',
  endId: '',
  elementType: '',
  technology: '',
  areaHolder: '',
  infraContractType: '',
  infraHolder: '',
  infraType: '',
  evType: '',
  evSupplier: '',
  address: '',
  regional: '',
  latitude: '',
  longitude: '',
  mobileCarrier: '',
  towerType: '',
  nominalAev: '',
  groundArea: '',
  structureHeight: '',
  stationId: '',
  notes: '',
  status: 'ativo',
}

const isTim = (form: StationFormState) => !form.mobileCarrier || form.mobileCarrier === 'TIM'

export const stationFormFields: StationFieldConfig[] = [
  { name: 'siteId', label: 'Site ID', size: 6, required: true },
  { name: 'endId', label: 'End ID', size: 6, required: true, visible: isTim },
  { name: 'elementType', label: 'Tipo de elemento', size: 6 },
  { name: 'technology', label: 'Tecnologia', size: 6 },
  { name: 'mobileCarrier', label: 'Operadora', size: 6, select: ['TIM', 'CLARO', 'VIVO', 'Outras'] },
  { name: 'status', label: 'Status', size: 6, required: true, select: ['ativo', 'inativo'] },
  { name: 'areaHolder', label: 'Detentor da Área', size: 6 },
  { name: 'infraHolder', label: 'Detentor de Infra', size: 6 },
  { name: 'infraContractType', label: 'Tipo de contrato Infra', size: 6 },
  { name: 'infraType', label: 'Tipo de Infra', size: 6 },
  { name: 'evType', label: 'Tipo de EV', size: 6 },
  { name: 'evSupplier', label: 'Fornecedor de EV', size: 6 },
  { name: 'regional', label: 'Regional', size: 6 },
  { name: 'towerType', label: 'Tipo da torre', size: 6 },
  { name: 'address', label: 'Endereço', size: 12 },
  { name: 'latitude', label: 'Latitude', size: 6, type: 'number' },
  { name: 'longitude', label: 'Longitude', size: 6, type: 'number' },
  { name: 'nominalAev', label: 'AEV Nominal', size: 6, type: 'number' },
  { name: 'groundArea', label: 'Área de solo', size: 6, type: 'number' },
  { name: 'structureHeight', label: 'Altura da estrutura', size: 6, type: 'number' },
  { name: 'stationId', label: 'Station ID (id da detentora)', size: 6 },
  { name: 'notes', label: 'Observações', size: 12, multiline: true, rows: 3 },
]

export function buildStationPayload(form: StationFormState) {
  const payload: any = {
    siteId: form.siteId,
    endId: isTim(form) ? form.endId : '',
    elementType: form.elementType,
    technology: form.technology,
    areaHolder: form.areaHolder,
    infraContractType: form.infraContractType,
    infraHolder: form.infraHolder,
    infraType: form.infraType,
    evType: form.evType,
    evSupplier: form.evSupplier,
    address: form.address,
    regional: form.regional,
    mobileCarrier: form.mobileCarrier,
    towerType: form.towerType,
    stationId: form.stationId,
    notes: form.notes,
    status: form.status,
  }
  if (form.latitude) payload.latitude = Number(form.latitude)
  if (form.longitude) payload.longitude = Number(form.longitude)
  if (form.nominalAev) payload.nominalAev = Number(form.nominalAev)
  if (form.groundArea) payload.groundArea = Number(form.groundArea)
  if (form.structureHeight) payload.structureHeight = Number(form.structureHeight)
  return payload
}

export interface StationFormStep {
  label: string
  fields: string[]
}

export const stationFormSteps: StationFormStep[] = [
  {
    label: 'Identificação',
    fields: ['siteId', 'endId', 'elementType', 'technology', 'mobileCarrier', 'status'],
  },
  {
    label: 'Infraestrutura',
    fields: [
      'areaHolder',
      'infraHolder',
      'infraContractType',
      'infraType',
      'evType',
      'evSupplier',
      'regional',
      'towerType',
    ],
  },
  {
    label: 'Localização',
    fields: ['address', 'latitude', 'longitude', 'nominalAev', 'groundArea', 'structureHeight', 'stationId', 'notes'],
  },
]
