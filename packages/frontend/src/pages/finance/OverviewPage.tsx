import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, Container, Grid, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ScheduleIcon from '@mui/icons-material/Schedule'
import api from '../../services/api'
import { formatCurrency, formatDate, monthNames } from '../../utils/format'
import EntryModal from './EntryModal'
import MonthYearPicker from '../../components/finance/MonthYearPicker'
import SummaryCards, { SummaryCardItem } from '../../components/finance/SummaryCards'
import QuickAccessButtons from '../../components/finance/QuickAccessButtons'
import EntriesListTable from '../../components/finance/EntriesListTable'
import EntryTypeChip from '../../components/finance/EntryTypeChip'
import { FinanceEntry, LimitReportItem, Summary, progressColor } from './financeTypes'

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
        api.get('/finance/entries', { params: { month, year, type: 'expense', status: 'pending', limit: 10 } }),
        api.get('/finance/entries', { params: { month, year, type: 'income', status: 'pending', limit: 10 } }),
        api.get('/finance/entries', { params: { month, year, type: 'expense', sortBy: 'amount', sortOrder: 'DESC', limit: 10 } }),
        api.get('/finance/reports/limits', { params: { month, year } }),
      ])
      setSummary(summaryRes.data)
      const normalize = (res: { data: FinanceEntry[] | { data?: FinanceEntry[] } }) =>
        Array.isArray(res.data) ? res.data : (res.data.data ?? [])
      setEntries(normalize(entriesRes))
      setPayables(normalize(payablesRes))
      setReceivables(normalize(receivablesRes))
      setTopExpenses(normalize(topExpensesRes).filter((e) => e.status !== 'canceled').slice(0, 5))
      setLimits(limitsRes.data.data ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a visão geral.')
    }
  }, [month, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const cards: SummaryCardItem[] = [
    { label: 'Receitas', value: summary?.income ?? 0, icon: <TrendingUpIcon sx={{ fontSize: 40 }} />, color: '#2e7d32', bg: 'rgba(46, 125, 50, 0.12)' },
    { label: 'Despesas', value: summary?.expenses ?? 0, icon: <TrendingDownIcon sx={{ fontSize: 40 }} />, color: '#c62828', bg: 'rgba(198, 40, 40, 0.12)' },
    { label: 'Saldo', value: summary?.balance ?? 0, icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />, color: '#1565c0', bg: 'rgba(21, 101, 192, 0.12)' },
    { label: 'Pendentes', value: summary?.pending ?? 0, icon: <ScheduleIcon sx={{ fontSize: 40 }} />, color: '#e65100', bg: 'rgba(230, 81, 0, 0.12)' },
  ]

  const openModal = (type: string) => setModal({ open: true, type })

  return (
    <Container sx={{ mt: 4 }}>
      <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}

      <QuickAccessButtons
        onNewIncome={() => openModal('income')}
        onNewExpense={() => openModal('expense')}
        onNewTransfer={() => openModal('transfer')}
      />

      <SummaryCards cards={cards} />

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
                      <EntryTypeChip type={entry.type} />
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
                        <LinearProgress variant="determinate" value={Math.min(limit.percentage, 100)} color={progressColor(limit.percentage)} />
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

      <EntriesListTable
        title="Contas a Pagar"
        entries={payables}
        emptyMessage="Nenhuma conta a pagar para este período."
        onViewAll={() => navigate('/finance?tab=3')}
      />
      <EntriesListTable
        title="Contas a Receber"
        entries={receivables}
        emptyMessage="Nenhuma conta a receber para este período."
        onViewAll={() => navigate('/finance?tab=3')}
      />
      <EntriesListTable
        title="Maiores Gastos do Mês"
        entries={topExpenses}
        emptyMessage="Nenhum gasto para este período."
        onViewAll={() => navigate('/finance?tab=3')}
      />

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
