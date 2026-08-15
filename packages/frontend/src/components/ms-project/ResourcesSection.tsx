import { useState } from 'react'
import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import ConfirmDialog from '../ConfirmDialog'
import { MsProjectDetail, MsResource, resourceTypeLabels } from '../../pages/ms-project/msProjectTypes'

interface ResourcesSectionProps {
  plan: MsProjectDetail
  onReload: () => void
  onEdit: (resource: MsResource) => void
  onNew: () => void
}

export default function ResourcesSection({ plan, onReload, onEdit, onNew }: ResourcesSectionProps) {
  const { showToast } = useToast()
  const [toDelete, setToDelete] = useState<MsResource | null>(null)

  const handleDelete = async (resource: MsResource) => {
    try {
      await api.delete(`/ms-project/resources/${resource.id}`)
      onReload()
      showToast('Recurso excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir o recurso.', 'error')
      setToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Recursos</Typography>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={onNew}>
          Novo Recurso
        </Button>
      </Box>
      {plan.resources.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhum recurso cadastrado.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Unid. máx.</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plan.resources.map((resource) => (
              <TableRow key={resource.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{resource.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{resource.email || ''}</Typography>
                </TableCell>
                <TableCell>{resourceTypeLabels[resource.type] || resource.type}</TableCell>
                <TableCell>{resource.maxUnits}%</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" onClick={() => onEdit(resource)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setToDelete(resource)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir recurso"
        message={`Tem certeza que deseja excluir o recurso "${toDelete?.name}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />
    </Paper>
  )
}
