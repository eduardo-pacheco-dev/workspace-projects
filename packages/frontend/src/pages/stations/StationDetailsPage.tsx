import { useState, useEffect, useCallback } from 'react'
import { Alert, Button, Container } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatDateTime } from '../../utils/format'
import StationModal from './StationModal'
import StationHeaderCard from '../../components/stations/StationHeaderCard'
import InfoFields from '../../components/ui/InfoFields'
import StationMapPanel from '../../components/stations/StationMapPanel'
import AttachmentsPanel from '../../components/stations/AttachmentsPanel'
import CommentsPanel from '../../components/stations/CommentsPanel'
import { Station } from './stationsTypes'

export default function StationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const stationId = Number(id)
  const [station, setStation] = useState<Station | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/stations/${stationId}`)
      setStation(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a estação.')
    }
  }, [stationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    try {
      await api.delete(`/stations/${stationId}`)
      showToast('Estação excluída com sucesso.')
      navigate('/stations')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
    }
  }

  const fields = station
    ? [
        { label: 'Site ID', value: station.siteId },
        ...(station.mobileCarrier === 'TIM'
          ? [{ label: 'End ID', value: station.endId }]
          : []),
        { label: 'Tipo de elemento', value: station.elementType || '-' },
        { label: 'Tecnologia', value: station.technology || '-' },
        { label: 'Operadora', value: station.mobileCarrier || '-' },
        { label: 'Regional', value: station.regional || '-' },
        { label: 'Tipo da torre', value: station.towerType || '-' },
        { label: 'Detentor da Área', value: station.areaHolder || '-' },
        { label: 'Detentor de Infra', value: station.infraHolder || '-' },
        { label: 'Tipo de contrato Infra', value: station.infraContractType || '-' },
        { label: 'Tipo de Infra', value: station.infraType || '-' },
        { label: 'Tipo de EV', value: station.evType || '-' },
        { label: 'Fornecedor de EV', value: station.evSupplier || '-' },
        { label: 'AEV Nominal', value: station.nominalAev != null ? String(station.nominalAev) : '-' },
        { label: 'Área de solo', value: station.groundArea != null ? String(station.groundArea) : '-' },
        { label: 'Altura da estrutura', value: station.structureHeight != null ? String(station.structureHeight) : '-' },
        { label: 'Station ID (id da detentora)', value: station.stationId || '-' },
        { label: 'Endereço', value: station.address || '-' },
        {
          label: 'Coordenadas',
          value:
            station.latitude != null && station.longitude != null
              ? `${station.latitude}, ${station.longitude}`
              : '-',
        },
        { label: 'Observações', value: station.notes || '-' },
        { label: 'Criado em', value: formatDateTime(station.createdAt ?? '') },
        { label: 'Atualizado em', value: formatDateTime(station.updatedAt ?? '') },
      ]
    : []

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/stations')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {station && (
        <>
          <StationHeaderCard
            station={station}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirmDelete(true)}
          />

          <InfoFields title="Informações da Estação" fields={fields} />

          <StationMapPanel station={station} />

          <AttachmentsPanel resource="station" resourceId={stationId} onError={setError} />

          <CommentsPanel resource="station" resourceId={stationId} onError={setError} />

          <StationModal
            open={editOpen}
            editId={stationId}
            onClose={() => setEditOpen(false)}
            onSaved={() => {
              setEditOpen(false)
              fetchData()
            }}
          />
        </>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir estação"
        message={`Tem certeza que deseja excluir a estação "${station?.siteId}"?`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
