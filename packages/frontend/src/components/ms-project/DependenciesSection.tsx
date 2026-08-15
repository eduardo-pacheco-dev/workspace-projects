import { useState } from 'react'
import { Chip, IconButton, Paper, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import ConfirmDialog from '../ui/ConfirmDialog'
import { MsProjectDetail, MsDependency, dependencyTypeLabels, taskName } from '../../pages/ms-project/msProjectTypes'

interface DependenciesSectionProps {
  plan: MsProjectDetail
  onReload: () => void
}

export default function DependenciesSection({ plan, onReload }: DependenciesSectionProps) {
  const { showToast } = useToast()
  const [toDelete, setToDelete] = useState<MsDependency | null>(null)

  const handleDelete = async (dependency: MsDependency) => {
    try {
      await api.delete(`/ms-project/dependencies/${dependency.id}`)
      onReload()
      showToast('Dependência excluída com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir a dependência.', 'error')
      setToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Dependências</Typography>
      {plan.dependencies.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhuma dependência cadastrada.</Typography>
      ) : (
        <Table size="small">
          <TableBody>
            {plan.dependencies.map((dependency) => (
              <TableRow key={dependency.id} hover>
                <TableCell>
                  {taskName(plan.tasks, dependency.predecessorTaskId)}{' '}
                  <Chip size="small" label={dependency.type} sx={{ mx: 0.5 }} />{' '}
                  {taskName(plan.tasks, dependency.taskId)}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {dependencyTypeLabels[dependency.type] || dependency.type}
                    {dependency.lagDays ? ` · lag ${dependency.lagDays}d` : ''}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => setToDelete(dependency)}>
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
        title="Excluir dependência"
        message="Tem certeza que deseja excluir esta dependência?"
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />
    </Paper>
  )
}
