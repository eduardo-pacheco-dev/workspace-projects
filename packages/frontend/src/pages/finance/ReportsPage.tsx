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
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ScheduleIcon from '@mui/icons-material/Schedule'
import api from '../../services/api'
import { formatCurrency, monthNames } from '../../utils/format'

interface Summary {
  income: number
  expenses: number
  balance: number
  pending: number
}

interface CategoryRow {
  category: string
  total: number
  count: number
}

export default function ReportsPage() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [summary, setSummary] = useState<Summary | null>(null)
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, categoryRes] = await Promise.all([
        api.get('/finance/reports/summary', { params: { month, year } }),
        api.get('/finance/reports/by-category', { params: { month, year } }),
      ])
      setSummary(summaryRes.data)
      setCategories(categoryRes.data.data ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o relatório.')
    }
  }, [month, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const maxCategory = categories.reduce((max, item) => Math.max(max, item.total), 0)

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
      <Typography variant="h4" sx={{ mb: 2 }}>Relatórios</Typography>

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

      <Typography variant="h5" sx={{ mb: 2 }}>Despesas por Categoria</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoria</TableCell>
              <TableCell align="right"># Lançamentos</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Participação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((row) => (
              <TableRow key={row.category} hover>
                <TableCell>{row.category}</TableCell>
                <TableCell align="right">{row.count}</TableCell>
                <TableCell align="right">{formatCurrency(row.total)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={maxCategory > 0 ? (row.total / maxCategory) * 100 : 0}
                        color="primary"
                      />
                    </Box>
                    <Typography variant="caption">
                      {maxCategory > 0 ? ((row.total / maxCategory) * 100).toFixed(0) : 0}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhuma despesa registrada para este período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
