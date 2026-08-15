import { useState, useEffect, useCallback } from 'react'
import { Alert, Button, Container } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { formatDateTime } from '../../utils/format'
import { formatPhone } from '../../utils/phone'
import ConfirmDialog from '../../components/ConfirmDialog'
import InfoFields from '../../components/stations/InfoFields'
import AttachmentsSection from '../../components/AttachmentsSection'
import ClientHeaderCard from '../../components/clients/ClientHeaderCard'
import ResponsaveisSection from '../../components/clients/ResponsaveisSection'
import ClientCommentsSection from '../../components/clients/ClientCommentsSection'
import ClientModal from './ClientModal'
import { Client } from './clientsTypes'

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const clientId = Number(id)
  const [client, setClient] = useState<Client | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/clients/${clientId}`)
      setClient(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o cliente.')
    }
  }, [clientId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    try {
      await api.delete(`/clients/${clientId}`)
      showToast('Cliente excluído com sucesso.')
      navigate('/clients')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setConfirmDelete(false)
    }
  }

  const infoFields = client
    ? [
        { label: 'CNPJ', value: client.documento || '-' },
        { label: 'Email', value: client.email || '-' },
        { label: 'Telefone', value: client.telefone ? formatPhone(client.telefone) : '-' },
        { label: 'Endereço', value: client.endereco || '-' },
        { label: 'Cidade / UF', value: `${client.cidade || '-'}${client.uf ? `/${client.uf}` : ''}` },
        { label: 'Observações', value: client.observacoes || '-' },
        { label: 'Criado em', value: formatDateTime(client.createdAt ?? '') },
        { label: 'Atualizado em', value: formatDateTime(client.updatedAt ?? '') },
      ]
    : []

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/clients')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {client && (
        <>
          <ClientHeaderCard
            client={client}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirmDelete(true)}
          />

          <InfoFields title="Informações do Cliente" fields={infoFields} />

          <ResponsaveisSection clientId={clientId} clientName={client.nome} />

          <AttachmentsSection resource="client" resourceId={clientId} onError={setError} />

          <ClientCommentsSection clientId={clientId} />

          <ClientModal
            open={editOpen}
            editId={clientId}
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
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir o cliente "${client?.nome}"?`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
