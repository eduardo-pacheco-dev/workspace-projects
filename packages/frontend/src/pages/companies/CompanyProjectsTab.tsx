import { useState, useEffect, useCallback } from 'react'
import {
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  IconButton,
  TextField,
  Pagination,
  Stack,
  MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import AddProjectDialog from './AddProjectDialog'
import { ProjectSummary } from './companiesTypes'

const PAGE_SIZE = 5

interface SortState {
  sortBy: string
  sortOrder: 'ASC' | 'DESC'
}

interface CompanyProjectsTabProps {
  companyId: number
}

export default function CompanyProjectsTab({ companyId }: CompanyProjectsTabProps) {
  const { showToast } = useToast()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState<SortState>({ sortBy: 'nome', sortOrder: 'ASC' })
  const [error, setError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [projectToRemove, setProjectToRemove] = useState<ProjectSummary | null>(null)
  const [allLinkedIds, setAllLinkedIds] = useState<number[]>([])

  const fetchProjects = useCallback(() => {
    api.get(`/companies/${companyId}/projects`, {
      params: {
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      },
    })
      .then((res) => {
        const d = res.data
        setProjects(Array.isArray(d) ? d : d.data ?? [])
        setTotal(Array.isArray(d) ? d.length : d.total ?? 0)
      })
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os projetos.'))
  }, [companyId, page, search, statusFilter, sort])

  const fetchAllLinkedIds = useCallback(() => {
    api.get(`/companies/${companyId}/projects`, { params: { limit: 1000 } })
      .then((res) => {
        const d = res.data
        const arr = Array.isArray(d) ? d : d.data ?? []
        setAllLinkedIds(arr.map((p: ProjectSummary) => p.id))
      })
      .catch(() => {})
  }, [companyId])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    fetchAllLinkedIds()
  }, [fetchAllLinkedIds])

  const handleLink = async (projectId: number) => {
    try {
      await api.post(`/companies/${companyId}/projects/${projectId}`)
      setAddOpen(false)
      fetchProjects()
      fetchAllLinkedIds()
      showToast('Projeto vinculado com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível vincular o projeto.', 'error')
    }
  }

  const handleRemove = async () => {
    if (!projectToRemove) return
    try {
      await api.delete(`/companies/${companyId}/projects/${projectToRemove.id}`)
      setProjectToRemove(null)
      fetchProjects()
      fetchAllLinkedIds()
      showToast('Projeto desvinculado com sucesso.')
    } catch (err: any) {
      setProjectToRemove(null)
      showToast(err.response?.data?.message || 'Não foi possível desvincular o projeto.', 'error')
    }
  }

  const handleSort = (sortBy: string) =>
    setSort((prev) => (prev.sortBy === sortBy
      ? { sortBy, sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' }
      : { sortBy, sortOrder: 'ASC' }))

  const formatDate = (value: string | null) => {
    if (!value) return '-'
    const date = new Date(`${value}T00:00:00`)
    return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
  }

  const sortableCell = (by: string, label: string) => (
    <TableSortLabel
      active={sort.sortBy === by}
      direction={sort.sortBy === by ? sort.sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
      onClick={() => handleSort(by)}
    >
      {label}
    </TableSortLabel>
  )

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6">Projetos</Typography>
            <Typography variant="body2" color="text.secondary">
              {total} projeto(s) vinculado(s)
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
          >
            Vincular Projeto
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            label="Buscar projeto"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <TextField
            select
            size="small"
            sx={{ minWidth: 160 }}
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
          </TextField>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {projects.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nenhum projeto encontrado.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{sortableCell('nome', 'Nome')}</TableCell>
                  <TableCell>{sortableCell('codigo', 'Código')}</TableCell>
                  <TableCell>{sortableCell('cliente', 'Cliente')}</TableCell>
                  <TableCell>{sortableCell('dataInicio', 'Início')}</TableCell>
                  <TableCell>{sortableCell('status', 'Status')}</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{p.nome}</TableCell>
                    <TableCell>{p.codigo || '-'}</TableCell>
                    <TableCell>{p.cliente || '-'}</TableCell>
                    <TableCell>{formatDate(p.dataInicio)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={p.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        color={p.status === 'ativo' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => setProjectToRemove(p)}>
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {total > PAGE_SIZE && (
          <Stack alignItems="center" sx={{ mt: 2 }}>
            <Pagination
              count={Math.ceil(total / PAGE_SIZE)}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
            />
          </Stack>
        )}
      </Paper>

      <AddProjectDialog
        open={addOpen}
        linkedIds={allLinkedIds}
        onClose={() => setAddOpen(false)}
        onLink={handleLink}
      />

      <ConfirmDialog
        open={!!projectToRemove}
        title="Desvincular projeto"
        message={`Tem certeza que deseja desvincular o projeto "${projectToRemove?.nome}"?`}
        confirmLabel="Desvincular"
        onClose={() => setProjectToRemove(null)}
        onConfirm={handleRemove}
      />
    </Box>
  )
}
