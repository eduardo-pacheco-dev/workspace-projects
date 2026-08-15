import { useState, useEffect, useCallback } from 'react'
import { Box, Button, Divider, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { formatPhone } from '../../utils/phone'
import ConfirmDialog from '../ConfirmDialog'
import ResponsavelModal from '../../pages/clients/ResponsavelModal'
import { Responsavel } from '../../pages/clients/clientsTypes'
import { downloadResponsaveisExcel } from '../../pages/clients/clientExport'

interface ResponsaveisSectionProps {
  clientId: number
  clientName: string
}

export default function ResponsaveisSection({ clientId, clientName }: ResponsaveisSectionProps) {
  const { showToast } = useToast()
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Responsavel | null>(null)
  const [toDelete, setToDelete] = useState<Responsavel | null>(null)

  const load = useCallback(() => {
    api.get(`/clients/${clientId}/responsaveis`)
      .then((res) => setResponsaveis(res.data))
      .catch(() => {})
  }, [clientId])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (responsavel: Responsavel) => {
    try {
      await api.delete(`/clients/responsaveis/${responsavel.id}`)
      load()
      showToast('Responsável excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir o responsável.', 'error')
      setToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6">Responsáveis</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<PersonAddIcon />} onClick={() => { setEditing(null); setModalOpen(true) }}>
            Adicionar Responsável
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={() => downloadResponsaveisExcel(responsaveis, clientName)}
            disabled={responsaveis.length === 0}
          >
            Exportar Excel
          </Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {responsaveis.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum responsável cadastrado.</Typography>
      ) : (
        <List dense disablePadding>
          {responsaveis.map((responsavel) => (
            <ListItem key={responsavel.id} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 44 }}>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={`${responsavel.nome} ${responsavel.sobrenome}`}
                secondary={[responsavel.funcao, responsavel.email, responsavel.telefone ? formatPhone(responsavel.telefone) : ''].filter(Boolean).join(' • ')}
              />
              <ListItemSecondaryAction>
                <IconButton size="small" onClick={() => { setEditing(responsavel); setModalOpen(true) }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setToDelete(responsavel)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <ResponsavelModal
        open={modalOpen}
        clientId={clientId}
        editData={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false)
          load()
        }}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir responsável"
        message={`Tem certeza que deseja excluir o responsável "${toDelete ? `${toDelete.nome} ${toDelete.sobrenome}` : ''}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />
    </Paper>
  )
}
