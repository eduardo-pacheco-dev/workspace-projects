import { useState, useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Add, Delete, Edit, FileDownload } from '@mui/icons-material'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { normalizeList } from '../../utils/list'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LpuModal from './LpuModal'
import FreelancerPicker from '../../components/lpu/FreelancerPicker'
import LpuStatusChip from '../../components/lpu/LpuStatusChip'
import { downloadFreelancerLpusExcel } from './lpuExport'
import { Lpu, FreelancerOption, freelancerFullName, formatValor } from './lpuTypes'

export default function LpuList() {
  const { showToast } = useToast()
  const [lpus, setLpus] = useState<Lpu[]>([])
  const [freelancers, setFreelancers] = useState<FreelancerOption[]>([])
  const [selectedFreelancer, setSelectedFreelancer] = useState('')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Lpu | null>(null)

  useEffect(() => {
    api.get('/collaborators', { params: { limit: 100, isFreelancer: true } })
      .then((res) => setFreelancers(normalizeList<FreelancerOption>(res.data).data))
      .catch(() => {})
  }, [])

  const fetchLpus = () => {
    if (!selectedFreelancer) {
      setLpus([])
      return
    }
    api.get(`/lpus/freelancer/${selectedFreelancer}`)
      .then((res) => setLpus(normalizeList<Lpu>(res.data).data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar a lista.'))
  }

  useEffect(() => {
    fetchLpus()
  }, [selectedFreelancer])

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/lpus/${id}`)
      fetchLpus()
      showToast('LPU excluída com sucesso.')
      setToDelete(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
      setToDelete(null)
    }
  }

  const handleExport = () => {
    const freelancer = freelancers.find((f) => f.id === Number(selectedFreelancer))
    const name = freelancer ? freelancerFullName(freelancer).replace(/\s+/g, '-') : selectedFreelancer
    downloadFreelancerLpusExcel(lpus, `lpus-${name}.xlsx`)
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">LPUs</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleExport} disabled={lpus.length === 0} startIcon={<FileDownload />}>
            Exportar Excel
          </Button>
          <Button variant="contained" onClick={() => { setEditId(null); setModalOpen(true) }} disabled={!selectedFreelancer} startIcon={<Add />}>
            Nova LPU
          </Button>
        </Box>
      </Box>

      <FreelancerPicker
        value={selectedFreelancer}
        freelancers={freelancers}
        onChange={setSelectedFreelancer}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lpus.length === 0 && selectedFreelancer && (
              <TableRow>
                <TableCell colSpan={6} align="center">Nenhuma LPU encontrada</TableCell>
              </TableRow>
            )}
            {lpus.map((lpu) => (
              <TableRow key={lpu.id} hover>
                <TableCell>{lpu.nome}</TableCell>
                <TableCell>{lpu.descricao || '-'}</TableCell>
                <TableCell>{formatValor(lpu.valor)}</TableCell>
                <TableCell>{lpu.data || '-'}</TableCell>
                <TableCell>
                  <LpuStatusChip status={lpu.status} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton onClick={() => { setEditId(lpu.id); setModalOpen(true) }}><Edit /></IconButton>
                    <IconButton onClick={() => setToDelete(lpu)}><Delete /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <LpuModal
        open={modalOpen}
        editId={editId}
        freelancerId={selectedFreelancer ? Number(selectedFreelancer) : null}
        freelancers={freelancers}
        onClose={() => setModalOpen(false)}
        onSaved={fetchLpus}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir LPU"
        message={`Tem certeza que deseja excluir a LPU "${toDelete?.nome}"?`}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
      />
    </Container>
  )
}
