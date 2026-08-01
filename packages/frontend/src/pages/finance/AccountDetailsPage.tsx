import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Grid,
  Card,
  CardContent,
  Paper,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../services/api'
import { formatCurrency, formatDate, monthNames } from '../../utils/format'
import AccountModal from './AccountModal'

interface BankAccount {
  id: number
  name: string
  bank: string | null
  balance: number
}

interface Summary {
  income: number
  expenses: number
  balance: number
  pending: number
}

interface FinanceEntry {
  id: number
  type: string
  description: string
  category: string
  amount: number
  date: string
  status: string
}

const typeLabels: Record<string, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
}

const typeColors: Record<string, 'success' | 'error' | 'info' | 'default'> = {
  income: 'success',
  expense: 'error',
  transfer: 'info',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  canceled: 'Cancelado',
}

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  paid: 'success',
  canceled: 'error',
}

export default function AccountDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id)
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [account, setAccount] = useState<BankAccount | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [accountRes, summaryRes, entriesRes] = await Promise.all([
        api.get(`/finance/accounts/${accountId}`),
        api.get('/finance/reports/summary', { params: { month, year, accountId } }),
        api.get('/finance/entries', {
          params: { page: page + 1, limit: rowsPerPage, month, year, accountId, sortBy: 'date', sortOrder: 'DESC' },
        }),
      ])
      setAccount(accountRes.data)
      setSummary(summaryRes.data)
      const data = Array.isArray(entriesRes.data) ? entriesRes.data : (entriesRes.data.data ?? [])
      setEntries(data)
      setTotal(entriesRes.data.total ?? data.length)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a conta.')
    }
  }, [accountId, month, year, page, rowsPerPage])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a conta "${account?.name}"?`)) return
    try {
      await api.delete(`/finance/accounts/${accountId}`)
      navigate('/finance?tab=1')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const cards = [
    {
      label: 'Receitas',
      value: summary?.income ?? 0,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bg: 'rgba(46, 125, 50, 0.12)',
    },
    {
      label: 'Despesas',
      value: summary?.expenses ?? 0,
      icon: <TrendingDownIcon sx={{ fontSize: 40 }} />,
      color: '#c62828',
      bg: 'rgba(198, 40, 40, 0.12)',
    },
    {
      label: 'Saldo do Período',
      value: summary?.balance ?? 0,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      color: '#1565c0',
      bg: 'rgba(21, 101, 192, 0.12)',
    },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/finance?tab=1')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {account && (
        <Card sx={{ mb: 3, bgcolor: 'rgba(21, 101, 192, 0.08)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h4">{account.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {account.bank || 'Sem banco'} · Saldo atual: <strong>{formatCurrency(account.balance)}</strong>
                </Typography>
              </Box>
              <Box>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)} sx={{ mr: 1 }}>
                  Editar
                </Button>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
                  Excluir
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          select
          label="Mês"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
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
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 90 }}
        />
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.label}>
            <Card sx={{ bgcolor: card.bg }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">{card.label}</Typography>
                  <Typography variant="h6" sx={{ color: card.color }}>
                    {formatCurrency(card.value)}
                  </Typography>
                </Box>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mb: 2 }}>Lançamentos</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Status</TableCell>
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
                <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                <TableCell>
                  <Chip size="small" label={statusLabels[entry.status] || entry.status} color={statusColors[entry.status] || 'default'} />
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum lançamento para este período.
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
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <AccountModal
        open={editOpen}
        editId={accountId}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false)
          fetchData()
        }}
      />
    </Container>
  )
}
