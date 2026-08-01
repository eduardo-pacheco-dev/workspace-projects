import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  IconButton,
  Alert,
  Box,
  TextField,
  MenuItem,
  Stack,
  Chip,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import api from '../../services/api'
import { formatCurrency, formatDate, monthNames } from '../../utils/format'
import EntryModal from './EntryModal'

interface FinanceEntry {
  id: number
  type: string
  description: string
  category: string
  amount: number
  date: string
  paymentMethod: string | null
  status: string
  notes: string | null
}

type SortBy = 'id' | 'date' | 'type' | 'category' | 'amount' | 'status' | 'description'
type SortOrder = 'ASC' | 'DESC'

const typeColors: Record<string, 'success' | 'error' | 'info' | 'default'> = {
  income: 'success',
  expense: 'error',
  transfer: 'info',
}

const typeLabels: Record<string, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
}

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  paid: 'success',
  canceled: 'error',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  canceled: 'Canceled',
}

export default function EntriesPage() {
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
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })

  const fetchData = useCallback(async () => {
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      params.month = month
      params.year = year

      const res = await api.get('/finance/entries', { params })
      if (Array.isArray(res.data)) {
        setEntries(res.data)
        setTotal(res.data.length)
      } else {
        setEntries(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load the list.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, typeFilter, statusFilter, month, year])

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
    if (!confirm('Are you sure you want to delete this entry?')) return
    try {
      await api.delete(`/finance/entries/${id}`)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete. Try again.')
    }
  }

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const columns: { id: SortBy; label: string }[] = [
    { id: 'date', label: 'Date' },
    { id: 'type', label: 'Type' },
    { id: 'description', label: 'Description' },
    { id: 'category', label: 'Category' },
    { id: 'amount', label: 'Amount' },
    { id: 'status', label: 'Status' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Entries</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModal({ open: true, editId: null })}
        >
          New Entry
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
        />
        <TextField
          size="small"
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="income">Income</MenuItem>
          <MenuItem value="expense">Expense</MenuItem>
          <MenuItem value="transfer">Transfer</MenuItem>
        </TextField>
        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="canceled">Canceled</MenuItem>
        </TextField>
        <TextField
          size="small"
          select
          label="Month"
          value={month}
          onChange={(e) => {
            setMonth(Number(e.target.value))
            setPage(0)
          }}
          sx={{ minWidth: 130 }}
        >
          {monthNames.map((name, i) => (
            <MenuItem key={i + 1} value={i + 1}>{name}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Year"
          type="number"
          value={year}
          onChange={(e) => {
            setYear(Number(e.target.value))
            setPage(0)
          }}
          sx={{ width: 90 }}
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  <TableSortLabel
                    active={sortBy === col.id}
                    direction={sortBy === col.id ? sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
                    onClick={() => handleSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>
                  <Chip size="small" label={typeLabels[entry.type] || entry.type} color={typeColors[entry.type] || 'default'} />
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.category}</TableCell>
                <TableCell>{formatCurrency(entry.amount)}</TableCell>
                <TableCell>
                  <Chip size="small" label={statusLabels[entry.status] || entry.status} color={statusColors[entry.status] || 'default'} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => setModal({ open: true, editId: entry.id })}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(entry.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
      />

      <EntryModal
        open={modal.open}
        editId={modal.editId}
        defaultDate={`${year}-${String(month).padStart(2, '0')}-01`}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />
    </Container>
  )
}
