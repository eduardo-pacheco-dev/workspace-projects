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
  MenuItem,
  Stack,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import api from '../../services/api'

interface Freelancer {
  id: number
  userId: number
  firstName: string
  lastName: string
  bio: string
  hourlyRate: number
  skills: string
  experienceLevel: string
  availability: string
}

interface Props {
  onNew: () => void
  onEdit: (id: number) => void
}

type SortBy = 'id' | 'firstName' | 'lastName' | 'hourlyRate' | 'experienceLevel' | 'availability'
type SortOrder = 'ASC' | 'DESC'

export default function FreelancerList({ onNew, onEdit }: Props) {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [expLevel, setExpLevel] = useState('')
  const [avail, setAvail] = useState('')
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy,
        sortOrder,
      }
      if (search) params.search = search
      if (expLevel) params.experienceLevel = expLevel
      if (avail) params.availability = avail

      const res = await api.get('/freelancers', { params })
      if (Array.isArray(res.data)) {
        setFreelancers(res.data)
        setTotal(res.data.length)
      } else {
        setFreelancers(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      console.error('FreelancerList fetch error:', err)
      setError(err.response?.data?.message || err.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, expLevel, avail])

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
    if (!confirm('Tem certeza que deseja excluir este freelancer?')) return
    try {
      await api.delete(`/freelancers/${id}`)
      fetchData()
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

  const columns: { id: SortBy; label: string }[] = [
    { id: 'firstName', label: 'Nome' },
    { id: 'lastName', label: 'Sobrenome' },
    { id: 'hourlyRate', label: 'Valor Hora' },
    { id: 'experienceLevel', label: 'Nível' },
    { id: 'availability', label: 'Disponibilidade' },
  ]

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Freelancers</Typography>
        <Button variant="contained" onClick={onNew}>
          Novo Freelancer
        </Button>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField size="small" label="Buscar" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} />
        <TextField size="small" select label="Nível" value={expLevel} onChange={(e) => { setExpLevel(e.target.value); setPage(0) }} sx={{ minWidth: 130 }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="junior">Junior</MenuItem>
          <MenuItem value="mid">Pleno</MenuItem>
          <MenuItem value="senior">Senior</MenuItem>
          <MenuItem value="lead">Lead</MenuItem>
        </TextField>
        <TextField size="small" select label="Disponibilidade" value={avail} onChange={(e) => { setAvail(e.target.value); setPage(0) }} sx={{ minWidth: 150 }}>
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="available">Disponível</MenuItem>
          <MenuItem value="busy">Ocupado</MenuItem>
          <MenuItem value="unavailable">Indisponível</MenuItem>
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
            {freelancers.map((f) => (
              <TableRow key={f.id} hover sx={{ cursor: 'pointer' }}>
                <TableCell>{f.firstName}</TableCell>
                <TableCell>{f.lastName}</TableCell>
                <TableCell>${f.hourlyRate}</TableCell>
                <TableCell>{f.experienceLevel}</TableCell>
                <TableCell>{f.availability}</TableCell>
                <TableCell>
                  <IconButton onClick={(e) => { e.stopPropagation(); onEdit(f.id) }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(f.id) }}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
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
    </Container>
  )
}
