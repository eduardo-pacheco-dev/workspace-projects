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
  Tabs,
  Tab,
  TextField,
  Pagination,
  Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import CollaboratorModal from './CollaboratorModal'
import AddFreelancerDialog from './AddFreelancerDialog'
import { formatDateTime } from '../../utils/format'
import { CompanyCollaborator, CompanyFreelancerLink } from './companiesTypes'

const PAGE_SIZE = 5

interface SortState {
  sortBy: string
  sortOrder: 'ASC' | 'DESC'
}

interface CompanyMembersTabProps {
  companyId: number
}

export default function CompanyMembersTab({ companyId }: CompanyMembersTabProps) {
  const { showToast } = useToast()
  const [subTab, setSubTab] = useState(0)
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [addFreelancerOpen, setAddFreelancerOpen] = useState(false)
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<CompanyCollaborator | null>(null)
  const [linkToRemove, setLinkToRemove] = useState<CompanyFreelancerLink | null>(null)

  const [collaborators, setCollaborators] = useState<CompanyCollaborator[]>([])
  const [collabTotal, setCollabTotal] = useState(0)
  const [collabPage, setCollabPage] = useState(1)
  const [collabSearch, setCollabSearch] = useState('')
  const [collabSort, setCollabSort] = useState<SortState>({ sortBy: 'nome', sortOrder: 'ASC' })

  const [linked, setLinked] = useState<CompanyFreelancerLink[]>([])
  const [linkedTotal, setLinkedTotal] = useState(0)
  const [linkedPage, setLinkedPage] = useState(1)
  const [linkedSearch, setLinkedSearch] = useState('')
  const [linkedSort, setLinkedSort] = useState<SortState>({ sortBy: 'createdAt', sortOrder: 'DESC' })
  const [allLinkedIds, setAllLinkedIds] = useState<number[]>([])

  const fetchCollaborators = useCallback(() => {
    api.get(`/companies/${companyId}/collaborators`, {
      params: {
        page: collabPage,
        limit: PAGE_SIZE,
        search: collabSearch || undefined,
        sortBy: collabSort.sortBy,
        sortOrder: collabSort.sortOrder,
      },
    })
      .then((res) => {
        const d = res.data
        setCollaborators(Array.isArray(d) ? d : d.data ?? [])
        setCollabTotal(Array.isArray(d) ? d.length : d.total ?? 0)
      })
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os colaboradores.'))
  }, [companyId, collabPage, collabSearch, collabSort])

  const fetchLinked = useCallback(() => {
    api.get(`/companies/${companyId}/freelancers`, {
      params: {
        page: linkedPage,
        limit: PAGE_SIZE,
        search: linkedSearch || undefined,
        sortBy: linkedSort.sortBy,
        sortOrder: linkedSort.sortOrder,
      },
    })
      .then((res) => {
        const d = res.data
        setLinked(Array.isArray(d) ? d : d.data ?? [])
        setLinkedTotal(Array.isArray(d) ? d.length : d.total ?? 0)
      })
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os freelancers vinculados.'))
  }, [companyId, linkedPage, linkedSearch, linkedSort])

  const fetchAllLinkedIds = useCallback(() => {
    api.get(`/companies/${companyId}/freelancers`, { params: { limit: 1000 } })
      .then((res) => {
        const d = res.data
        const arr = Array.isArray(d) ? d : d.data ?? []
        setAllLinkedIds(arr.map((l: CompanyFreelancerLink) => l.freelancerId))
      })
      .catch(() => {})
  }, [companyId])

  useEffect(() => {
    fetchCollaborators()
  }, [fetchCollaborators])

  useEffect(() => {
    fetchLinked()
  }, [fetchLinked])

  useEffect(() => {
    fetchAllLinkedIds()
  }, [fetchAllLinkedIds])

  const handleDeleteCollaborator = async () => {
    if (!collaboratorToDelete) return
    try {
      await api.delete(`/companies/${companyId}/collaborators/${collaboratorToDelete.id}`)
      setCollaboratorToDelete(null)
      fetchCollaborators()
      showToast('Colaborador excluído com sucesso.')
    } catch (err: any) {
      setCollaboratorToDelete(null)
      showToast(err.response?.data?.message || 'Não foi possível excluir o colaborador.', 'error')
    }
  }

  const handleLinkFreelancer = async (freelancerId: number) => {
    try {
      await api.post(`/companies/${companyId}/freelancers/${freelancerId}`)
      setAddFreelancerOpen(false)
      fetchLinked()
      fetchAllLinkedIds()
      showToast('Freelancer vinculado com sucesso.')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível vincular o freelancer.', 'error')
    }
  }

  const handleRemoveLink = async () => {
    if (!linkToRemove) return
    try {
      await api.delete(`/companies/${companyId}/freelancers/${linkToRemove.freelancerId}`)
      setLinkToRemove(null)
      fetchLinked()
      fetchAllLinkedIds()
      showToast('Freelancer desvinculado com sucesso.')
    } catch (err: any) {
      setLinkToRemove(null)
      showToast(err.response?.data?.message || 'Não foi possível desvincular o freelancer.', 'error')
    }
  }

  const handleCollabSort = (sortBy: string) =>
    setCollabSort((prev) => (prev.sortBy === sortBy
      ? { sortBy, sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' }
      : { sortBy, sortOrder: 'ASC' }))

  const handleLinkedSort = (sortBy: string) =>
    setLinkedSort((prev) => (prev.sortBy === sortBy
      ? { sortBy, sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' }
      : { sortBy, sortOrder: 'ASC' }))

  const countActive = collaborators.filter((c) => c.ativo).length

  const sortableCell = (sort: SortState, onSort: (by: string) => void, by: string, label: string) => (
    <TableSortLabel
      active={sort.sortBy === by}
      direction={sort.sortBy === by ? sort.sortOrder.toLowerCase() as 'asc' | 'desc' : 'asc'}
      onClick={() => onSort(by)}
    >
      {label}
    </TableSortLabel>
  )

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs
        value={subTab}
        onChange={(_, value) => setSubTab(value)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label={`Colaboradores (${collabTotal})`} />
        <Tab label={`Freelancers (${linkedTotal})`} />
      </Tabs>

      {subTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6">Colaboradores</Typography>
              <Typography variant="body2" color="text.secondary">
                {collabTotal} colaborador(es) · {countActive} ativo(s)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setModal({ open: true, editId: null })}
            >
              Adicionar Colaborador
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="Buscar colaborador"
              value={collabSearch}
              onChange={(e) => {
                setCollabSearch(e.target.value)
                setCollabPage(1)
              }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          {collaborators.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum colaborador encontrado.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{sortableCell(collabSort, handleCollabSort, 'nome', 'Nome')}</TableCell>
                    <TableCell>{sortableCell(collabSort, handleCollabSort, 'cargo', 'Cargo')}</TableCell>
                    <TableCell>{sortableCell(collabSort, handleCollabSort, 'email', 'E-mail')}</TableCell>
                    <TableCell>{sortableCell(collabSort, handleCollabSort, 'telefone', 'Telefone')}</TableCell>
                    <TableCell>{sortableCell(collabSort, handleCollabSort, 'ativo', 'Status')}</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collaborators.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{c.nome}</TableCell>
                      <TableCell>{c.cargo || '-'}</TableCell>
                      <TableCell>{c.email || '-'}</TableCell>
                      <TableCell>{c.telefone || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={c.ativo ? 'Ativo' : 'Inativo'}
                          color={c.ativo ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" onClick={() => setModal({ open: true, editId: c.id })}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setCollaboratorToDelete(c)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {collabTotal > PAGE_SIZE && (
            <Stack alignItems="center" sx={{ mt: 2 }}>
              <Pagination
                count={Math.ceil(collabTotal / PAGE_SIZE)}
                page={collabPage}
                onChange={(_, value) => setCollabPage(value)}
                size="small"
              />
            </Stack>
          )}
        </Paper>
      )}

      {subTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6">Freelancers</Typography>
              <Typography variant="body2" color="text.secondary">
                {linkedTotal} freelancer(s) vinculado(s)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddFreelancerOpen(true)}
            >
              Vincular Freelancer
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="Buscar freelancer"
              value={linkedSearch}
              onChange={(e) => {
                setLinkedSearch(e.target.value)
                setLinkedPage(1)
              }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          {linked.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum freelancer encontrado.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{sortableCell(linkedSort, handleLinkedSort, 'firstName', 'Nome')}</TableCell>
                    <TableCell>{sortableCell(linkedSort, handleLinkedSort, 'email', 'E-mail')}</TableCell>
                    <TableCell>{sortableCell(linkedSort, handleLinkedSort, 'createdAt', 'Vinculado em')}</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {linked.map((l) => (
                    <TableRow key={l.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {l.freelancer.firstName} {l.freelancer.lastName}
                      </TableCell>
                      <TableCell>{l.freelancer.email || '-'}</TableCell>
                      <TableCell>{formatDateTime(l.createdAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => setLinkToRemove(l)}>
                          <LinkOffIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {linkedTotal > PAGE_SIZE && (
            <Stack alignItems="center" sx={{ mt: 2 }}>
              <Pagination
                count={Math.ceil(linkedTotal / PAGE_SIZE)}
                page={linkedPage}
                onChange={(_, value) => setLinkedPage(value)}
                size="small"
              />
            </Stack>
          )}
        </Paper>
      )}

      <CollaboratorModal
        open={modal.open}
        companyId={companyId}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={fetchCollaborators}
      />

      <AddFreelancerDialog
        open={addFreelancerOpen}
        linkedIds={allLinkedIds}
        onClose={() => setAddFreelancerOpen(false)}
        onLink={handleLinkFreelancer}
      />

      <ConfirmDialog
        open={!!collaboratorToDelete}
        title="Excluir colaborador"
        message={`Tem certeza que deseja excluir o colaborador "${collaboratorToDelete?.nome}"?`}
        onClose={() => setCollaboratorToDelete(null)}
        onConfirm={handleDeleteCollaborator}
      />

      <ConfirmDialog
        open={!!linkToRemove}
        title="Desvincular freelancer"
        message={`Tem certeza que deseja desvincular o freelancer "${linkToRemove?.freelancer.firstName} ${linkToRemove?.freelancer.lastName}"?`}
        confirmLabel="Desvincular"
        onClose={() => setLinkToRemove(null)}
        onConfirm={handleRemoveLink}
      />
    </Box>
  )
}
