import { useState, useEffect, useCallback } from 'react'
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LimitModal from './LimitModal'
import LimitsTable from '../../components/finance/LimitsTable'
import MonthYearPicker from '../../components/finance/MonthYearPicker'
import { LimitReportItem } from './financeTypes'

export default function LimitsPage() {
  const { showToast } = useToast()
  const today = new Date()
  const [limits, setLimits] = useState<LimitReportItem[]>([])
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [error, setError] = useState('')
  const [modal, setModal] = useState({ open: false, editId: null as number | null })
  const [toDelete, setToDelete] = useState<LimitReportItem | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/finance/reports/limits', { params: { month, year } })
      setLimits(res.data.data ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar os limites.')
    }
  }, [month, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/finance/limits/${id}`)
      fetchData()
      showToast('Limite de gasto excluído com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setToDelete(null)
    }
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Limites de Gastos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setModal({ open: true, editId: null })}>
          Novo Limite
        </Button>
      </Box>

      <Stack sx={{ mb: 2 }}>
        <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <LimitsTable
        limits={limits}
        onEdit={(limit) => setModal({ open: true, editId: limit.id })}
        onDelete={setToDelete}
      />

      <LimitModal
        open={modal.open}
        editId={modal.editId}
        defaultMonth={month}
        defaultYear={year}
        onClose={() => setModal({ open: false, editId: null })}
        onSaved={() => fetchData()}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir limite de gasto"
        message={`Tem certeza que deseja excluir este limite de gasto?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
