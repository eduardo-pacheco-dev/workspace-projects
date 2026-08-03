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
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
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
import { CompanyCollaborator, CompanyFreelancerLink } from './companiesTypes'

interface CompanyMembersTabProps {
  companyId: number
}

export default function CompanyMembersTab({ companyId }: CompanyMembersTabProps) {
  const { showToast } = useToast()
  const [collaborators, setCollaborators] = useState<CompanyCollaborator[]>([])
  const [linked, setLinked] = useState<CompanyFreelancerLink[]>([])
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [addFreelancerOpen, setAddFreelancerOpen] = useState(false)
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<CompanyCollaborator | null>(null)
  const [linkToRemove, setLinkToRemove] = useState<CompanyFreelancerLink | null>(null)
  const [subTab, setSubTab] = useState(0)

  const fetchData = useCallback(() => {
    setError('')
    api.get(`/companies/${companyId}/collaborators`)
      .then((res) => setCollaborators(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os colaboradores.'))
    api.get(`/companies/${companyId}/freelancers`)
      .then((res) => setLinked(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os freelancers vinculados.'))
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteCollaborator = async () => {
    if (!collaboratorToDelete) return
    try {
      await api.delete(`/companies/${companyId}/collaborators/${collaboratorToDelete.id}`)
      setCollaboratorToDelete(null)
      fetchData()
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
      fetchData()
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
      fetchData()
      showToast('Freelancer desvinculado com sucesso.')
    } catch (err: any) {
      setLinkToRemove(null)
      showToast(err.response?.data?.message || 'Não foi possível desvincular o freelancer.', 'error')
    }
  }

  const countActive = collaborators.filter((c) => c.ativo).length

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs
        value={subTab}
        onChange={(_, value) => setSubTab(value)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label={`Colaboradores (${collaborators.length})`} />
        <Tab label={`Freelancers (${linked.length})`} />
      </Tabs>

      {subTab === 0 && (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6">Colaboradores</Typography>
            <Typography variant="body2" color="text.secondary">
              {collaborators.length} colaborador(es) · {countActive} ativo(s)
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
        <Divider sx={{ mb: 2 }} />
        {collaborators.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nenhum colaborador cadastrado.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Status</TableCell>
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
      </Paper>
      )}

      {subTab === 1 && (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h6">Freelancers</Typography>
            <Typography variant="body2" color="text.secondary">
              {linked.length} freelancer(s) vinculado(s)
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
        <Divider sx={{ mb: 2 }} />
        {linked.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Nenhum freelancer vinculado.</Typography>
        ) : (
          <List dense disablePadding>
            {linked.map((l) => (
              <ListItem key={l.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={`${l.freelancer.firstName} ${l.freelancer.lastName}`}
                  secondary={l.freelancer.email || '-'}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" color="error" onClick={() => setLinkToRemove(l)}>
                    <LinkOffIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      )}

      <CollaboratorModal
        open={modal.open}
        companyId={companyId}
        editId={modal.editId}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={fetchData}
      />

      <AddFreelancerDialog
        open={addFreelancerOpen}
        linkedIds={linked.map((l) => l.freelancerId)}
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
