import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Paper,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import api from '../../services/api'
import PlanModal from './PlanModal'
import {
  MsProjectSummary,
  msProjectStatusLabels,
  msProjectStatusColors,
  formatDate,
} from './msProjectTypes'

export default function MsProjectPage() {
  const navigate = useNavigate()

  const [plans, setPlans] = useState<MsProjectSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })

  const fetchPlans = useCallback(async () => {
    setError('')
    try {
      const res = await api.get('/ms-project', {
        params: { page: page + 1, limit: rowsPerPage, sortBy: 'startDate', sortOrder: 'ASC' },
      })
      if (Array.isArray(res.data)) {
        setPlans(res.data)
        setTotal(res.data.length)
      } else {
        setPlans(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar os planos.')
    }
  }, [page, rowsPerPage])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este plano e todas as suas tarefas?')) return
    try {
      await api.delete(`/ms-project/${id}`)
      fetchPlans()
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

  const criticalCount = (plan: MsProjectSummary) => plan.status

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4">Cronograma (MS Project)</Typography>
          <Typography variant="body2" color="text.secondary">
            {total} plano(s) de projeto
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Novo Plano
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plano</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Término</TableCell>
              <TableCell>Duração (dias úteis)</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                hover
                onClick={() => navigate(`/ms-project/${plan.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontWeight: 600 }}>
                  {plan.name}
                  {criticalCount(plan) === 'behind' && (
                    <Chip size="small" color="error" label="atrasado" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={msProjectStatusLabels[plan.status] || plan.status}
                    color={msProjectStatusColors[plan.status] || 'default'}
                  />
                </TableCell>
                <TableCell>{formatDate(plan.startDate)}</TableCell>
                <TableCell>{formatDate(plan.endDate)}</TableCell>
                <TableCell>{plan.durationDays ?? '-'}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Excluir plano">
                    <IconButton onClick={() => handleDelete(plan.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum plano encontrado.
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
        labelRowsPerPage="Por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <PlanModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchPlans()}
      />
    </Container>
  )
}
