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
  Tabs,
  Tab,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { Edit, Delete, Add, Upload, Map as MapIcon, ListAlt, TableView, GridView } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import StationModal from './StationModal'
import ImportStationsModal from './ImportStationsModal'
import StationsMapTab from './StationsMapTab'

interface Station {
  id: number
  siteId: string
  endId: string
  address: string | null
  latitude: number | null
  longitude: number | null
  mobileCarrier: string | null
  notes: string | null
  status: string
}

type SortBy = 'id' | 'siteId' | 'endId' | 'address' | 'mobileCarrier' | 'status'
type SortOrder = 'ASC' | 'DESC'

export default function StationsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [stations, setStations] = useState<Station[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [mobileCarrierFilter, setMobileCarrierFilter] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

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
      if (mobileCarrierFilter) params.mobileCarrier = mobileCarrierFilter

      const res = await api.get('/stations', { params })
      if (Array.isArray(res.data)) {
        setStations(res.data)
        setTotal(res.data.length)
      } else {
        setStations(res.data.data ?? [])
        setTotal(res.data.total ?? 0)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a lista.')
    }
  }, [page, rowsPerPage, sortBy, sortOrder, search, statusFilter, mobileCarrierFilter])

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
      await api.delete(`/stations/${id}`)
      fetchData()
      showToast('Estação excluída com sucesso.')
      setStationToDelete(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
      showToast(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.', 'error')
      setStationToDelete(null)
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
    { id: 'siteId', label: 'Site ID' },
    { id: 'endId', label: 'End ID' },
    { id: 'mobileCarrier', label: 'Operadora' },
    { id: 'address', label: 'Endereço' },
    { id: 'status', label: 'Status' },
  ]

  const getInitials = (siteId: string) =>
    siteId.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'

  const endIdLabel = (s: Station) => (s.mobileCarrier === 'TIM' ? s.endId : '-')

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Estações (ERBS)</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Upload />} onClick={() => setImportOpen(true)}>
            Importar
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
            Nova Estação
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
        <TextField
          size="small"
          select
          label="Operadora"
          value={mobileCarrierFilter}
          onChange={(e) => {
            setMobileCarrierFilter(e.target.value)
            setPage(0)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="TIM">TIM</MenuItem>
          <MenuItem value="CLARO">CLARO</MenuItem>
          <MenuItem value="VIVO">VIVO</MenuItem>
          <MenuItem value="Outras">Outras</MenuItem>
        </TextField>
        {tab === 0 && (
          <>
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
          </>
        )}
      </Stack>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab icon={<ListAlt />} iconPosition="start" label="Lista" />
        <Tab icon={<MapIcon />} iconPosition="start" label="Mapa" />
      </Tabs>

      {tab === 1 ? (
        <StationsMapTab search={search} status={statusFilter} mobileCarrier={mobileCarrierFilter} />
      ) : (
        <>
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
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stations.map((s) => (
                <TableRow
                  key={s.id}
                  hover
                  onClick={() => navigate(`/stations/${s.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{s.siteId}</TableCell>
                  <TableCell>{s.mobileCarrier === 'TIM' ? s.endId : '-'}</TableCell>
                  <TableCell>{s.mobileCarrier || '-'}</TableCell>
                  <TableCell>{s.address || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={s.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      color={s.status === 'ativo' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        setModal({ open: true, editId: s.id })
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        setStationToDelete(s)
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {stations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhuma estação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box>
          {stations.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Nenhuma estação encontrada.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {stations.map((s) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={s.id}>
                  <Card
                    variant="outlined"
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                    onClick={() => navigate(`/stations/${s.id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
                          {getInitials(s.siteId)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                            {s.siteId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {endIdLabel(s)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" variant="outlined" label={s.mobileCarrier || '-'} />
                        <Chip
                          size="small"
                          label={s.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          color={s.status === 'ativo' ? 'success' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Endereço: {s.address || '-'}
                      </Typography>
                      {s.latitude != null && s.longitude != null && (
                        <Typography variant="body2" color="text.secondary">
                          Coordenadas: {s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={(e) => {
                          e.stopPropagation()
                          setModal({ open: true, editId: s.id })
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={(e) => {
                          e.stopPropagation()
                          setStationToDelete(s)
                        }}
                      >
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

      <StationModal
        open={modal.open}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={!!stationToDelete}
        title="Excluir estação"
        message={`Tem certeza que deseja excluir a estação "${stationToDelete?.siteId}"?`}
        onClose={() => setStationToDelete(null)}
        onConfirm={() => stationToDelete && handleDelete(stationToDelete.id)}
      />

      <ImportStationsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => fetchData()}
      />
        </>
      )}
    </Container>
  )
}
