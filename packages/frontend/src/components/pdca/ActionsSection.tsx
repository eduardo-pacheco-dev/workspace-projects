import { useState } from 'react'
import { Box, Button, Divider, IconButton, List, ListItem, ListItemText, Paper, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import ConfirmDialog from '../ConfirmDialog'
import PdcaChip from './PdcaChip'
import PdcaActionModal from '../../pages/pdca/PdcaActionModal'
import { PdcaAction, formatPdcaDate, formatMoney, formatSizePercent } from '../../pages/pdca/pdcaTypes'

interface ActionsSectionProps {
  pdcaId: number
  actions: PdcaAction[]
  onReload: () => void
}

export default function ActionsSection({ pdcaId, actions, onReload }: ActionsSectionProps) {
  const { showToast } = useToast()
  const [actionModal, setActionModal] = useState({ open: false, editData: null as PdcaAction | null })
  const [toDelete, setToDelete] = useState<PdcaAction | null>(null)

  const handleDelete = async (action: PdcaAction) => {
    try {
      await api.delete(`/pdca/${pdcaId}/actions/${action.id}`)
      showToast('Ação excluída com sucesso.')
      onReload()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Não foi possível excluir a ação.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Plano de Ação (5W2H)</Typography>
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setActionModal({ open: true, editData: null })}>
          Nova Ação
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {actions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nenhuma ação cadastrada.</Typography>
      ) : (
        <List dense disablePadding>
          {actions.map((action) => (
            <ListItem
              key={action.id}
              sx={{
                px: 0,
                borderLeft: '4px solid',
                borderColor: action.atrasado || action.status === 'atrasado' ? 'error.main' : 'divider',
                pl: 1,
              }}
            >
              <ListItemText
                primary={action.what}
                secondary={
                  <>
                    <Box component="span" sx={{ display: 'block' }}>
                      {[action.why, action.ondeAplicacao, action.who].filter(Boolean).join(' • ') || '—'}
                    </Box>
                    <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
                      Início: {formatPdcaDate(action.whenInicio)} · Prazo: {formatPdcaDate(action.whenPrazo)} · Progresso: {formatSizePercent(action.progresso)} · Custo: {formatMoney(action.howMuch)}
                    </Box>
                  </>
                }
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <PdcaChip kind="statusAcao" value={action.status} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size="small" onClick={() => setActionModal({ open: true, editData: action })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setToDelete(action)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      <PdcaActionModal
        open={actionModal.open}
        pdcaId={pdcaId}
        editData={actionModal.editData}
        onClose={() => setActionModal({ open: false, editData: null })}
        onSaved={() => {
          setActionModal({ open: false, editData: null })
          onReload()
        }}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir ação"
        message={`Tem certeza que deseja excluir a ação "${toDelete?.what}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete)}
      />
    </Paper>
  )
}
