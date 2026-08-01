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
  Paper,
  IconButton,
  Alert,
  Box,
  TextField,
  MenuItem,
  Stack,
  LinearProgress,
  Chip,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import api from '../../services/api'
import { formatCurrency, monthNames } from '../../utils/format'
import LimitModal from './LimitModal'

interface LimitReportItem {
  id: number
  category: string
  month: number
  year: number
  amount: number
  spent: number
  remaining: number
  percentage: number
}

export default function LimitsPage() {
  const today = new Date()
  const [limits, setLimits] = useState<LimitReportItem[]>([])
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/finance/reports/limits', { params: { month, year } })
      setLimits(res.data.data ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar os limites.')
    }
  }, [month, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este limite de gasto?')) return
    try {
      await api.delete(`/finance/limits/${id}`)
      fetchData()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const progressColor = (percentage: number) => {
    if (percentage >= 100) return 'error' as const
    if (percentage >= 80) return 'warning' as const
    return 'success' as const
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Limites de Gastos</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModal({ open: true, editId: null })}
        >
          Novo Limite
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoria</TableCell>
              <TableCell>Período</TableCell>
              <TableCell align="right">Limite</TableCell>
              <TableCell align="right">Gasto</TableCell>
              <TableCell align="right">Restante</TableCell>
              <TableCell sx={{ minWidth: 180 }}>Progresso</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {limits.map((limit) => (
              <TableRow key={limit.id} hover>
                <TableCell>{limit.category}</TableCell>
                <TableCell>{monthNames[limit.month - 1]} / {limit.year}</TableCell>
                <TableCell align="right">{formatCurrency(limit.amount)}</TableCell>
                <TableCell align="right">{formatCurrency(limit.spent)}</TableCell>
                <TableCell align="right">
                  {limit.remaining >= 0 ? (
                    formatCurrency(limit.remaining)
                  ) : (
                    <Chip size="small" label="Acima do limite" color="error" />
                  )}
                </TableCell>
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
                <TableCell>
                  <IconButton onClick={() => setModal({ open: true, editId: limit.id })}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(limit.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {limits.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum limite de gastos encontrado para este período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <LimitModal
        open={modal.open}
        editId={modal.editId}
        defaultMonth={month}
        defaultYear={year}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />
    </Container>
  )
}
