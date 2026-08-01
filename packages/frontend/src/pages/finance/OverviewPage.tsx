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
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
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
  const [limits, setLimits] = useState<LimitReportItem[]>([])
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, type: 'expense' })

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, entriesRes, limitsRes] = await Promise.all([
        api.get('/finance/reports/summary', { params: { month, year } }),
        api.get('/finance/entries', { params: { month, year, limit: 5 } }),
        api.get('/finance/reports/limits', { params: { month, year } }),
      ])
      setSummary(summaryRes.data)
      setEntries(Array.isArray(entriesRes.data) ? entriesRes.data : (entriesRes.data.data ?? []))
      setLimits(limitsRes.data.data ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load the overview.')
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
      label: 'Income',
      value: summary?.income ?? 0,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bg: 'rgba(46, 125, 50, 0.12)',
    },
    {
      label: 'Expenses',
      value: summary?.expenses ?? 0,
      icon: <TrendingDownIcon sx={{ fontSize: 40 }} />,
      color: '#c62828',
      bg: 'rgba(198, 40, 40, 0.12)',
    },
    {
      label: 'Balance',
      value: summary?.balance ?? 0,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      color: '#1565c0',
      bg: 'rgba(21, 101, 192, 0.12)',
    },
    {
      label: 'Pending',
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
          label="Month"
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
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ width: 90 }}
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Quick Access</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<ArrowUpwardIcon />}
            onClick={() => setModal({ open: true, type: 'income' })}
          >
            New Income
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<ArrowDownwardIcon />}
            onClick={() => setModal({ open: true, type: 'expense' })}
          >
            New Expense
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="info"
            startIcon={<SwapHorizIcon />}
            onClick={() => setModal({ open: true, type: 'transfer' })}
          >
            New Transfer
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
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Recent Entries</Typography>
            <Button size="small" onClick={() => navigate('/finance?tab=1')}>
              View all
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
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
                      No entries for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Spending Limits</Typography>
            <Button size="small" onClick={() => navigate('/finance?tab=3')}>
              View all
            </Button>
          </Box>
          <Paper sx={{ p: 2 }}>
            {limits.map((limit) => (
              <Box key={limit.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{limit.category}</Typography>
                  <Typography variant="caption">
                    {formatCurrency(limit.spent)} / {formatCurrency(limit.amount)}
                  </Typography>
                </Box>
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
              </Box>
            ))}
            {limits.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center">
                No spending limits for this period.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

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
