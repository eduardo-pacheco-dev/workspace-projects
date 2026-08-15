import { useState, useEffect, useCallback } from 'react'
import { Alert, Container, TablePagination } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PlanModal from './PlanModal'
import MsProjectToolbar from '../../components/ms-project/MsProjectToolbar'
import MsProjectTable from '../../components/ms-project/MsProjectTable'
import { MsProjectSummary } from './msProjectTypes'

export default function MsProjectPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [plans, setPlans] = useState<MsProjectSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<MsProjectSummary | null>(null)

  const fetchPlans = useCallback(async () => {
    setError('')
    try {
      const res = await api.get('/ms-project', {
        params: { page: page + 1, limit: rowsPerPage, sortBy: 'startDate', sortOrder: 'ASC' },
      })
      const { data, total: fetchedTotal } = normalizeList<MsProjectSummary>(res.data)
      setPlans(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar os planos.')
    }
  }, [page, rowsPerPage])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/ms-project/${id}`)
      fetchPlans()
      showToast('Plano excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setToDelete(null)
    }
  }

  const handleChangePage = (_: any, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Container sx={{ mt: 4 }}>
      <MsProjectToolbar total={total} onNew={() => setModal({ open: true, editId: null })} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <MsProjectTable
        plans={plans}
        onOpen={(plan) => navigate(`/ms-project/${plan.id}`)}
        onDelete={setToDelete}
      />

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <PlanModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchPlans()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir plano"
        message={`Tem certeza que deseja excluir o plano "${toDelete?.name}" e todas as suas tarefas?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
