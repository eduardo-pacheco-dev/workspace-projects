import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Container } from '@mui/material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ConfirmDialog'
import ProposalsToolbar from '../../components/proposals/ProposalsToolbar'
import ProposalsTable from '../../components/proposals/ProposalsTable'
import { Proposal } from './proposalsTypes'

export default function ProposalList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState<Proposal | null>(null)

  useEffect(() => {
    api.get('/proposals')
      .then((res) => setProposals(normalizeList<Proposal>(res.data).data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar a lista.'))
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/proposals/${id}`)
      setProposals((prev) => prev.filter((p) => p.id !== id))
      showToast('Proposta excluída com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setToDelete(null)
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <ProposalsToolbar onNew={() => navigate('/proposals/new')} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ProposalsTable
        proposals={proposals}
        onOpen={(proposal) => navigate(`/proposals/${proposal.id}`)}
        onEdit={(proposal) => navigate(`/proposals/${proposal.id}/edit`)}
        onDelete={setToDelete}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir proposta"
        message={`Tem certeza que deseja excluir esta proposta?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
