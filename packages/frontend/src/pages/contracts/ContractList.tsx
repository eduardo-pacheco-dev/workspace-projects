import { useState, useEffect } from 'react'
import { Alert, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ContractsToolbar from '../../components/contracts/ContractsToolbar'
import ContractsTable from '../../components/contracts/ContractsTable'
import { Contract } from './contractsTypes'

export default function ContractList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState<Contract | null>(null)

  useEffect(() => {
    api.get('/contracts')
      .then((res) => setContracts(normalizeList<Contract>(res.data).data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar a lista.'))
  }, [])

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/contracts/${id}`)
      setContracts((prev) => prev.filter((c) => c.id !== id))
      showToast('Contrato excluído com sucesso.')
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
      <ContractsToolbar onNew={() => navigate('/contracts/new')} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ContractsTable
        contracts={contracts}
        onOpen={(contract) => navigate(`/contracts/${contract.id}`)}
        onEdit={(contract) => navigate(`/contracts/${contract.id}/edit`)}
        onDelete={setToDelete}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir contrato"
        message="Tem certeza que deseja excluir este contrato?"
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
