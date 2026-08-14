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
  Stack,
  Chip,
  MenuItem,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { Edit, Delete, Add, FileDownload, TableView, GridView } from '@mui/icons-material'
import * as XLSX from 'xlsx'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LpuModal from './LpuModal'

interface Lpu {
  id: number
  freelancerId: number
  freelancer?: { id: number; nome: string } | null
  nome: string
  descricao?: string | null
  valor?: number | null
  data?: string | null
  status: string
}

interface Freelancer {
  id: number
  firstName: string
  lastName: string
}

type SortBy = 'id' | 'nome' | 'valor' | 'data' | 'status' | 'createdAt' | 'freelancer'
type SortOrder = 'ASC' | 'DESC'

const formatValor = (valor: number | null | undefined) =>
  valor != null ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'

export default function LpuPage() {
  const { showToast } = useToast()
  const [lpus, setLpus] = useState<Lpu[]>([])
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('nome')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [deleteTarget, setDeleteTarget] = useState<Lpu | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/lpus', { params })
      if (Array.isArray(res.data)) {
        setLpus(res.data)
        setTotal(res.data.length)
      } else {
        setLpus(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    api.get('/collaborators', { params: { limit: 100, isFreelancer: true } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setFreelancers(data)
      })
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

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/lpus/${deleteTarget.id}`)
      showToast('LPU excluída com sucesso.')
      fetchData()
      setDeleteTarget(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = async () => {
    try {
      const params: any = {
        page: 1,
        limit: 10000,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const res = await api.get('/lpus', { params })
      const list: Lpu[] = Array.isArray(res.data) ? res.data : (res.data.data ?? [])

      const rows = list.map((l) => ({
        Freelancer: l.freelancer?.nome || '',
        Nome: l.nome,
        Descrição: l.descricao || '',
        Valor: l.valor ?? '',
        Data: l.data || '',
        Status: l.status === 'ativo' ? 'Ativo' : 'Inativo',
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [
        { wch: 28 },
        { wch: 30 },
        { wch: 40 },
        { wch: 14 },
        { wch: 14 },
        { wch: 10 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'LPUs')
      XLSX.writeFile(wb, `lpus-${new Date().toISOString().slice(0, 10)}.xlsx`)
      showToast('LPUs exportadas com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível exportar. Tente novamente.', 'error')
    }
  }

  const columns: { id: SortBy; label: string }[] = [
    { id: 'freelancer', label: 'Freelancer' },
    { id: 'nome', label: 'Nome' },
    { id: 'valor', label: 'Valor' },
    { id: 'data', label: 'Data' },
    { id: 'status', label: 'Status' },
  ]

  const getInitials = (nome: string) =>
    nome.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">LPUs</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExport}>
            Exportar Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
            Nova LPU
          </Button>
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          label="Buscar"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 250 }}
        />
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
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="inativo">Inativo</MenuItem>
        </TextField>
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={viewMode}
          onChange={(_, v) => v && setViewMode(v)}
        >
          <ToggleButton value="table" aria-label="Visualizar em tabela">
            <TableView fontSize="small" />
          </ToggleButton>
          <ToggleButton value="cards" aria-label="Visualizar em cartões">
            <GridView fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {viewMode === 'table' ? (
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
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lpus.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell>{l.freelancer?.nome || '-'}</TableCell>
                  <TableCell>{l.nome}</TableCell>
                  <TableCell>{formatValor(l.valor)}</TableCell>
                  <TableCell>{l.data || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={l.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      color={l.status === 'ativo' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                      <IconButton onClick={() => setModal({ open: true, editId: l.id })}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => setDeleteTarget(l)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {lpus.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhuma LPU encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box>
          {lpus.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Nenhuma LPU encontrada.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {lpus.map((l) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={l.id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                          {getInitials(l.nome)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                            {l.nome}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {l.freelancer?.nome || 'Sem freelancer'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          size="small"
                          label={l.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          color={l.status === 'ativo' ? 'success' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Valor: {formatValor(l.valor)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Data: {l.data || '-'}
                      </Typography>
                      {l.descricao && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {l.descricao}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
                      <Button size="small" startIcon={<Edit />} onClick={() => setModal({ open: true, editId: l.id })}>
                        Editar
                      </Button>
                      <Button size="small" color="error" startIcon={<Delete />} onClick={() => setDeleteTarget(l)}>
                        Excluir
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

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

      <LpuModal
        open={modal.open}
        editId={modal.editId}
        freelancers={freelancers}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <Dialog open={!!deleteTarget} onClose={() => { if (!deleting) setDeleteTarget(null) }}>
        <DialogTitle>Excluir LPU</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a LPU <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
