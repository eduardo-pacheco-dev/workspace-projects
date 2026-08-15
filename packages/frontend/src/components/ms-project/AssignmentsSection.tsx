import { useState } from 'react'
import { IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import ConfirmDialog from '../ConfirmDialog'
import { MsProjectDetail, MsAssignment, taskName, resourceName } from '../../pages/ms-project/msProjectTypes'

interface AssignmentsSectionProps {
  plan: MsProjectDetail
  onReload: () => void
}

export default function AssignmentsSection({ plan, onReload }: AssignmentsSectionProps) {
  const { showToast } = useToast()
  const [toDelete, setToDelete] = useState<MsAssignment | null>(null)

  const handleDelete = async (assignment: MsAssignment) => {
    try {
      await api.delete(`/ms-project/assignments/${assignment.id}`)
      onReload()
      showToast('Atribuição excluída com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir a atribuição.', 'error')
      setToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Atribuições</Typography>
      {plan.assignments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhuma atribuição cadastrada.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tarefa</TableCell>
              <TableCell>Recurso</TableCell>
              <TableCell>Unidades</TableCell>
              <TableCell>Trabalho (h)</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plan.assignments.map((assignment) => (
              <TableRow key={assignment.id} hover>
                <TableCell>{taskName(plan.tasks, assignment.taskId)}</TableCell>
                <TableCell>{resourceName(plan.resources, assignment.resourceId)}</TableCell>
                <TableCell>{assignment.units}%</TableCell>
                <TableCell>{assignment.work ?? '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => setToDelete(assignment)}>
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
        title="Excluir atribuição"
        message="Tem certeza que deseja excluir esta atribuição?"
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />
    </Paper>
  )
}
