import { useState, useEffect, useCallback } from 'react'
import { Alert, Button, Container } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatDateTime } from '../../utils/format'
import InfoFields from '../../components/ui/InfoFields'
import AttachmentsPanel from '../../components/stations/AttachmentsPanel'
import CommentsPanel from '../../components/stations/CommentsPanel'
import RadioLinkModal from './RadioLinkModal'
import RadioLinkHeaderCard from '../../components/radio-links/RadioLinkHeaderCard'
import RadioLinkEndPanel from '../../components/radio-links/RadioLinkEndPanel'
import RadioLinkMapPanel from '../../components/radio-links/RadioLinkMapPanel'
import { RadioLink } from './radioLinksTypes'

export default function RadioLinkDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const radioLinkId = Number(id)
  const [radioLink, setRadioLink] = useState<RadioLink | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/radio-links/${radioLinkId}`)
      setRadioLink(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o enlace.')
    }
  }, [radioLinkId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    try {
      await api.delete(`/radio-links/${radioLinkId}`)
      showToast('Enlace de rádio excluído com sucesso.')
      navigate('/radio-links')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
    }
  }

  const infoFields = radioLink
    ? [
        { label: 'Nome', value: radioLink.nome },
        { label: 'Frequência', value: radioLink.frequencia || '-' },
        { label: 'Capacidade', value: radioLink.capacidade || '-' },
        { label: 'Observações', value: radioLink.observacoes || '-' },
        { label: 'Criado em', value: formatDateTime(radioLink.createdAt ?? '') },
        { label: 'Atualizado em', value: formatDateTime(radioLink.updatedAt ?? '') },
      ]
    : []

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/radio-links')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {radioLink && (
        <>
          <RadioLinkHeaderCard
            radioLink={radioLink}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirmDelete(true)}
          />

          <InfoFields title="Informações do Enlace" fields={infoFields} />

          <RadioLinkEndPanel
            title="Estação A"
            end={{
              siteId: radioLink.siteIdA,
              endId: radioLink.endIdA,
              endereco: radioLink.enderecoA,
              latitude: radioLink.latitudeA,
              longitude: radioLink.longitudeA,
              operadora: radioLink.operadoraA,
            }}
          />
          <RadioLinkEndPanel
            title="Estação B"
            end={{
              siteId: radioLink.siteIdB,
              endId: radioLink.endIdB,
              endereco: radioLink.enderecoB,
              latitude: radioLink.latitudeB,
              longitude: radioLink.longitudeB,
              operadora: radioLink.operadoraB,
            }}
          />

          <RadioLinkMapPanel radioLink={radioLink} />

          <AttachmentsPanel resource="radio-link" resourceId={radioLinkId} onError={setError} />

          <CommentsPanel resource="radio-link" resourceId={radioLinkId} onError={setError} />

          <RadioLinkModal
            open={editOpen}
            editId={radioLinkId}
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
        title="Excluir enlace de rádio"
        message={`Tem certeza que deseja excluir o enlace "${radioLink?.nome}"?`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
