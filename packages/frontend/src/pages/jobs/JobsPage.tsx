import { useState, useEffect, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatusChip from '../../components/ui/StatusChip'
import JobModal from './JobModal'
import {
  Job,
  JobSortBy,
  SortOrder,
  jobStatusLabels,
  jobStatusColors,
  jobStatusOptions,
  formatJobDate,
} from './jobsTypes'

export default function JobsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [items, setItems] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<JobSortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<Job | null>(null)
  const [toRun, setToRun] = useState<Job | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params: any = { page: page + 1, limit: rowsPerPage, sortBy, sortOrder }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/jobs', { params })
      const { data, total: fetchedTotal } = normalizeList<Job>(res.data)
      setItems(data)
      setTotal(fetchedTotal)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar os jobs.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (col: JobSortBy) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'))
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/jobs/${id}`)
      fetchData()
      showToast('Job excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir.'
      showToast(message, 'error')
      setToDelete(null)
    }
  }

  const handleRun = async (id: number) => {
    setToRun(null)
    try {
      const res = await api.post(`/jobs/${id}/run`)
      showToast(`Job "${res.data.nome}" executado com sucesso.`)
      fetchData()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível executar o job.', 'error')
    }
  }

  const handleChangePage = (_: any, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const openCreate = () => setModal({ open: true, editId: null })
  const openEdit = (job: Job) => setModal({ open: true, editId: job.id })

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Box component="h4" sx={{ m: 0 }}>Jobs</Box>
          <Typography variant="body2" color="text.secondary">Tarefas agendadas do sistema</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Buscar"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          placeholder="Nome, tipo ou descrição"
        />
        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {jobStatusOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {(['nome', 'tipo', 'status', 'ultimoExecutadoEm', 'proximaExecucaoEm'] as JobSortBy[]).map((col) => (
                <TableCell key={col} sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort(col)}>
                  {({
                    nome: 'Nome',
                    tipo: 'Tipo',
                    status: 'Status',
                    ultimoExecutadoEm: 'Última Execução',
                    proximaExecucaoEm: 'Próxima Execução',
                  } as Record<JobSortBy, string>)[col]}
                </TableCell>
              ))}
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((job) => (
              <TableRow key={job.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                <TableCell>{job.nome}</TableCell>
                <TableCell>{job.tipo}</TableCell>
                <TableCell>
                  <StatusChip value={job.status} labels={jobStatusLabels} colors={jobStatusColors} />
                </TableCell>
                <TableCell>{formatJobDate(job.ultimoExecutadoEm)}</TableCell>
                <TableCell>{formatJobDate(job.proximaExecucaoEm)}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Executar agora">
                    <span>
                      <IconButton size="small" color="primary" onClick={() => setToRun(job)} disabled={job.status === 'executando'}>
                        <PlayArrowIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <IconButton size="small" color="inherit" onClick={() => openEdit(job)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setToDelete(job)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhum job encontrado.
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

      <JobModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir job"
        message={`Tem certeza que deseja excluir o job "${toDelete?.nome}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />

      <ConfirmDialog
        open={Boolean(toRun)}
        title="Executar job"
        message={`Deseja executar agora o job "${toRun?.nome}"?`}
        confirmLabel="Executar"
        onClose={() => setToRun(null)}
        onConfirm={() => toRun && handleRun(toRun.id)}
      />
    </Container>
  )
}