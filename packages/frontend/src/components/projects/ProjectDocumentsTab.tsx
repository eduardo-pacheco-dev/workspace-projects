import { useState, useEffect, useCallback } from 'react'
import { Box, Divider, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../../services/api'
import Button from '../ui/Button'
import DeleteModal from '../modals/DeleteModal'
import { ProjectDocument } from '../../pages/projects/projectsTypes'
import ProjectDocumentModal from '../../pages/projects/ProjectDocumentModal'

interface ProjectDocumentsTabProps {
  projectId: number
  onError: (message: string) => void
}

export default function ProjectDocumentsTab({ projectId, onError }: ProjectDocumentsTabProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [docModal, setDocModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<ProjectDocument | null>(null)

  const fetchDocuments = useCallback(() => {
    api.get(`/projects/${projectId}/documents`)
      .then((res) => setDocuments(res.data ?? []))
      .catch(() => {})
  }, [projectId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDelete = async (docId: number) => {
    try {
      await api.delete(`/projects/${projectId}/documents/${docId}`)
      fetchDocuments()
      setToDelete(null)
    } catch (err: any) {
      onError(err.response?.data?.message || 'Não foi possível excluir o documento.')
      setToDelete(null)
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>Documentos</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure quais documentos serão necessários, tipos e quantidades.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setDocModal({ open: true, editId: null })}
        >
          Novo Documento
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {documents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum documento configurado.</Typography>
      ) : (
        <List dense disablePadding>
          {documents.map((doc) => (
            <ListItem key={doc.id} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 44 }}>
                <DescriptionIcon color="action" />
              </ListItemIcon>
              <ListItemText
                primary={doc.nome}
                secondary={`${doc.tipo || 'Sem tipo'} · Quantidade: ${doc.quantidade}${doc.observacoes ? ` · ${doc.observacoes}` : ''}`}
              />
              <ListItemSecondaryAction>
                <IconButton size="small" color="primary" onClick={() => setDocModal({ open: true, editId: doc.id })}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => setToDelete(doc)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <ProjectDocumentModal
        open={docModal.open}
        projectId={projectId}
        editId={docModal.editId}
        onClose={() => setDocModal({ open: false, editId: null })}
        onSaved={() => {
          setDocModal({ open: false, editId: null })
          fetchDocuments()
        }}
      />

      <DeleteModal
        open={Boolean(toDelete)}
        title="Excluir documento"
        message={`Tem certeza que deseja excluir o documento "${toDelete?.nome}" da configuração? Esta ação não poderá ser desfeita.`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Paper>
  )
}
