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
  LinearProgress,
  Chip,
  Button,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ScheduleIcon from '@mui/icons-material/Schedule'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import api from '../../services/api'
import { formatCurrency, formatDate, monthNames } from '../../utils/format'
import EntryModal from './EntryModal'

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

interface LimitReportItem {
  id: number
  category: string
  amount: number
  spent: number
  remaining: number
  percentage: number
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

export default function OverviewPage() {
  const navigate = useNavigate()
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [summary, setSummary] = useState<Summary | null>(null)
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [payables, setPayables] = useState<FinanceEntry[]>([])
  const [receivables, setReceivables] = useState<FinanceEntry[]>([])
  const [topExpenses, setTopExpenses] = useState<FinanceEntry[]>([])
  const [limits, setLimits] = useState<LimitReportItem[]>([])
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, type: 'expense' })

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, entriesRes, payablesRes, receivablesRes, topExpensesRes, limitsRes] = await Promise.all([
        api.get('/finance/reports/summary', { params: { month, year } }),
        api.get('/finance/entries', { params: { month, year, limit: 5 } }),
        api.get('/finance/entries', {
          params: { month, year, type: 'expense', status: 'pending', limit: 10 },
        }),
        api.get('/finance/entries', {
          params: { month, year, type: 'income', status: 'pending', limit: 10 },
        }),
        api.get('/finance/entries', {
          params: { month, year, type: 'expense', sortBy: 'amount', sortOrder: 'DESC', limit: 10 },
        }),
        api.get('/finance/reports/limits', { params: { month, year } }),
      ])
      setSummary(summaryRes.data)
      setEntries(Array.isArray(entriesRes.data) ? entriesRes.data : (entriesRes.data.data ?? []))
      setPayables(Array.isArray(payablesRes.data) ? payablesRes.data : (payablesRes.data.data ?? []))
      setReceivables(Array.isArray(receivablesRes.data) ? receivablesRes.data : (receivablesRes.data.data ?? []))
      setTopExpenses(
        (Array.isArray(topExpensesRes.data) ? topExpensesRes.data : (topExpensesRes.data.data ?? []))
          .filter((e: FinanceEntry) => e.status !== 'canceled')
          .slice(0, 5),
      )
      setLimits(limitsRes.data.data ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a visão geral.')
    }
  }, [month, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const progressColor = (percentage: number) => {
    if (percentage >= 100) return 'error' as const
    if (percentage >= 80) return 'warning' as const
    return 'success' as const
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
      label: 'Saldo',
      value: summary?.balance ?? 0,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      color: '#1565c0',
      bg: 'rgba(21, 101, 192, 0.12)',
    },
    {
      label: 'Pendentes',
      value: summary?.pending ?? 0,
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: '#e65100',
      bg: 'rgba(230, 81, 0, 0.12)',
    },
  ]

  return (
    <Container sx={{ mt: 4 }}>
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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Acesso Rápido</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<ArrowUpwardIcon />}
            onClick={() => setModal({ open: true, type: 'income' })}
          >
            Nova Receita
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<ArrowDownwardIcon />}
            onClick={() => setModal({ open: true, type: 'expense' })}
          >
            Nova Despesa
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="info"
            startIcon={<SwapHorizIcon />}
            onClick={() => setModal({ open: true, type: 'transfer' })}
          >
            Nova Transferência
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
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

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Lançamentos Recentes</Typography>
            <Button size="small" onClick={() => navigate('/finance?tab=3')}>
              Ver todos
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor</TableCell>
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
                    <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                  </TableRow>
                ))}
                {entries.length === 0 && (
                  <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum lançamento para este período.
                  </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">
            Limite de Gastos de {monthNames[month - 1]} de {year}
          </Typography>
          <Button size="small" onClick={() => navigate('/finance?tab=5')}>
            Ver todos
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Categoria</TableCell>
                <TableCell align="right">Limite</TableCell>
                <TableCell align="right">Gasto</TableCell>
                <TableCell align="right">Restante</TableCell>
                <TableCell sx={{ width: '30%' }}>Progresso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {limits.map((limit) => (
                <TableRow key={limit.id} hover>
                  <TableCell>{limit.category}</TableCell>
                  <TableCell align="right">{formatCurrency(limit.amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(limit.spent)}</TableCell>
                  <TableCell align="right">{formatCurrency(limit.remaining)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(limit.percentage, 100)}
                          color={progressColor(limit.percentage)}
                        />
                      </Box>
                      <Typography variant="caption">{limit.percentage.toFixed(0)}%</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {limits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum limite de gastos para este período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Contas a Pagar</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total: {formatCurrency(payables.reduce((sum, e) => sum + e.amount, 0))}
            </Typography>
            <Button size="small" onClick={() => navigate('/finance?tab=3')}>
              Ver todos
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payables.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                </TableRow>
              ))}
              {payables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhuma conta a pagar para este período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Contas a Receber</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total: {formatCurrency(receivables.reduce((sum, e) => sum + e.amount, 0))}
            </Typography>
            <Button size="small" onClick={() => navigate('/finance?tab=3')}>
              Ver todos
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receivables.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                </TableRow>
              ))}
              {receivables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhuma conta a receber para este período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Maiores Gastos do Mês</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total: {formatCurrency(topExpenses.reduce((sum, e) => sum + e.amount, 0))}
            </Typography>
            <Button size="small" onClick={() => navigate('/finance?tab=3')}>
              Ver todos
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topExpenses.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                </TableRow>
              ))}
              {topExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum gasto para este período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <EntryModal
        open={modal.open}
        defaultType={modal.type}
        onClose={() => setModal({ open: false, type: modal.type })}
        onSaved={() => {
          setModal({ open: false, type: modal.type })
          fetchData()
        }}
      />
    </Container>
  )
}
