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
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import RadioLinkModal from './RadioLinkModal'

interface RadioLink {
  id: number
  nome: string
  frequencia: string | null
  capacidade: string | null
  siteIdA: string | null
  endIdA: string | null
  operadoraA: string | null
  siteIdB: string | null
  endIdB: string | null
  operadoraB: string | null
  status: string
}

type SortBy = 'id' | 'nome' | 'frequencia' | 'capacidade' | 'siteIdA' | 'siteIdB' | 'status'
type SortOrder = 'ASC' | 'DESC'

export default function RadioLinksPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [radioLinks, setRadioLinks] = useState<RadioLink[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [linkToDelete, setLinkToDelete] = useState<RadioLink | null>(null)

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

      const res = await api.get('/radio-links', { params })
      if (Array.isArray(res.data)) {
        setRadioLinks(res.data)
        setTotal(res.data.length)
      } else {
        setRadioLinks(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter])

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
    try {
      await api.delete(`/radio-links/${id}`)
      fetchData()
      showToast('Enlace de rádio excluído com sucesso.')
      setLinkToDelete(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
      setLinkToDelete(null)
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
    { id: 'nome', label: 'Nome' },
    { id: 'frequencia', label: 'Frequência' },
    { id: 'capacidade', label: 'Capacidade' },
    { id: 'siteIdA', label: 'Estação A' },
    { id: 'siteIdB', label: 'Estação B' },
    { id: 'status', label: 'Status' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Enlaces de Rádio</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Novo Enlace
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
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
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {radioLinks.map((r) => (
              <TableRow
                key={r.id}
                hover
                onClick={() => navigate(`/radio-links/${r.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{r.nome}</TableCell>
                <TableCell>{r.frequencia || '-'}</TableCell>
                <TableCell>{r.capacidade || '-'}</TableCell>
                <TableCell>{r.siteIdA || '-'}</TableCell>
                <TableCell>{r.siteIdB || '-'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={r.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={r.status === 'ativo' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setModal({ open: true, editId: r.id })
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      setLinkToDelete(r)
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {radioLinks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhum enlace de rádio encontrado.
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

      <RadioLinkModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={!!linkToDelete}
        title="Excluir enlace de rádio"
        message={`Tem certeza que deseja excluir o enlace "${linkToDelete?.nome}"?`}
        onClose={() => setLinkToDelete(null)}
        onConfirm={() => linkToDelete && handleDelete(linkToDelete.id)}
      />
    </Container>
  )
}
