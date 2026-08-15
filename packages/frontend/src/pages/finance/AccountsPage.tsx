import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, Container, Stack, TablePagination, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import { formatCurrency } from '../../utils/format'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import AccountModal from './AccountModal'
import AccountsTable from '../../components/finance/AccountsTable'
import SearchField from '../../components/finance/SearchField'
import { BankAccount, SortOrder } from './financeTypes'

type SortBy = 'id' | 'name' | 'bank' | 'balance'

export default function AccountsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<BankAccount | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search

      const res = await api.get('/finance/accounts', { params })
      const { data, total: fetchedTotal } = normalizeList<BankAccount>(res.data)
      setAccounts(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar as contas.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (col: SortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/finance/accounts/${id}`)
      fetchData()
      showToast('Conta excluída com sucesso.')
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

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Contas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Nova Conta
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} alignItems="center">
        <SearchField value={search} onChange={(value) => { setSearch(value); setPage(0) }} />
        <Typography variant="body1">
          Saldo total: <strong>{formatCurrency(totalBalance)}</strong>
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AccountsTable
        accounts={accounts}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onOpen={(account) => navigate(`/finance/accounts/${account.id}`)}
        onEdit={(account) => setModal({ open: true, editId: account.id })}
        onDelete={setToDelete}
      />

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <AccountModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir conta"
        message={`Tem certeza que deseja excluir a conta "${toDelete?.name}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
