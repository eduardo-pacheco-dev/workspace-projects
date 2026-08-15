import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, Container, MenuItem, Stack, TablePagination, TextField, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import { monthNames } from '../../utils/format'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EntryModal from './EntryModal'
import EntriesTable from '../../components/finance/EntriesTable'
import SearchField from '../../components/finance/SearchField'
import { FinanceEntry, SortOrder, entryTypeLabels, entryStatusLabels } from './financeTypes'

type SortBy = 'id' | 'date' | 'type' | 'category' | 'amount' | 'status' | 'description'

export default function EntriesPage() {
  const { showToast } = useToast()
  const today = new Date()
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [accounts, setAccounts] = useState<{ id: number; name: string }[]>([])
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<FinanceEntry | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder, month, year }
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      if (accountFilter) params.accountId = accountFilter

      const res = await api.get('/finance/entries', { params })
      const { data, total: fetchedTotal } = normalizeList<FinanceEntry>(res.data)
      setEntries(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, typeFilter, statusFilter, accountFilter, month, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    api.get('/finance/accounts', { params: { limit: 100, sortBy: 'name', sortOrder: 'ASC' } })
      .then((res) => setAccounts(normalizeList<{ id: number; name: string }>(res.data).data))
      .catch(() => {})
  }, [])

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
      await api.delete(`/finance/entries/${id}`)
      fetchData()
      showToast('Lançamento excluído com sucesso.')
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

  const resetFilterAndPage = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setPage(0)
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Lançamentos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Novo Lançamento
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <SearchField value={search} onChange={resetFilterAndPage(setSearch)} />
        <TextField
          size="small"
          select
          label="Tipo"
          value={typeFilter}
          onChange={(e) => resetFilterAndPage(setTypeFilter)(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(entryTypeLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => resetFilterAndPage(setStatusFilter)(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(entryStatusLabels).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Conta"
          value={accountFilter}
          onChange={(e) => resetFilterAndPage(setAccountFilter)(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>{account.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Mês"
          value={month}
          onChange={(e) => { setMonth(Number(e.target.value)); setPage(0) }}
          sx={{ minWidth: 130 }}
        >
          {monthNames.map((name, i) => (
            <MenuItem key={i + 1} value={i + 1}>{name}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Ano"
          type="number"
          value={year}
          onChange={(e) => { setYear(Number(e.target.value)); setPage(0) }}
          sx={{ width: 90 }}
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <EntriesTable
        entries={entries}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={(entry) => setModal({ open: true, editId: entry.id })}
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

      <EntryModal
        open={modal.open}
        editId={modal.editId}
        defaultDate={`${year}-${String(month).padStart(2, '0')}-01`}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir lançamento"
        message={`Tem certeza que deseja excluir o lançamento "${toDelete?.description}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
