import { useState, useEffect, useCallback } from 'react'
import { Box, Button, Container, Grid } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import DeleteModal from '../../components/modals/DeleteModal'
import ErrorState from '../../components/ui/ErrorState'
import InfoCard from '../../components/ui/InfoCard'
import PageLoader from '../../components/ui/PageLoader'
import { formatDateTime } from '../../utils/format'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/radio-links/${radioLinkId}`)
      setRadioLink(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o enlace.')
    } finally {
      setLoading(false)
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

  const sections = radioLink
    ? [
        {
          title: 'Identificação',
          fields: [
            { label: 'Nome', value: radioLink.nome },
            { label: 'Frequência', value: radioLink.frequencia || '-' },
            { label: 'Capacidade', value: radioLink.capacidade || '-' },
            { label: 'Status', value: radioLink.status === 'ativo' ? 'Ativo' : 'Inativo' },
          ],
        },
        {
          title: 'Registro',
          fields: [
            { label: 'Observações', value: radioLink.observacoes || '-' },
            { label: 'Criado em', value: formatDateTime(radioLink.createdAt ?? '') },
            { label: 'Atualizado em', value: formatDateTime(radioLink.updatedAt ?? '') },
          ],
        },
      ]
    : []

  return (
    <Container sx={{ mt: 3, mb: 6 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/radio-links')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <ErrorState message={error} />}

      {loading && <PageLoader py={10} />}

      {radioLink && (
        <>
          <RadioLinkHeaderCard
            radioLink={radioLink}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirmDelete(true)}
          />

          <Grid container spacing={3} sx={{ mt: 0 }}>
            {sections.map((section) => (
              <Grid item xs={12} md={6} key={section.title}>
                <InfoCard title={section.title} fields={section.fields} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
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
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <RadioLinkMapPanel radioLink={radioLink} />
          </Box>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} lg={7}>
              <AttachmentsPanel resource="radio-link" resourceId={radioLinkId} onError={setError} />
            </Grid>
            <Grid item xs={12} lg={5}>
              <CommentsPanel resource="radio-link" resourceId={radioLinkId} onError={setError} />
            </Grid>
          </Grid>

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

      <DeleteModal
        open={confirmDelete}
        title="Excluir enlace de rádio"
        message={`Tem certeza que deseja excluir o enlace "${radioLink?.nome}"? Esta ação não poderá ser desfeita.`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
