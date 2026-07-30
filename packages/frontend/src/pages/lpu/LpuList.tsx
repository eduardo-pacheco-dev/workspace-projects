import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Box,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import api from '../../services/api'
import LpuModal from './LpuModal'

interface Lpu {
  id: number
  freelancerId: number
  nome: string
  descricao?: string
  valor?: number
  data?: string
  status: string
}

interface Freelancer {
  id: number
  firstName: string
  lastName: string
}

export default function LpuList() {
  const [lpus, setLpus] = useState<Lpu[]>([])
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [selectedFreelancer, setSelectedFreelancer] = useState('')
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  useEffect(() => {
    api.get('/freelancers?limit=100')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data.data ?? [])
        setFreelancers(data)
      })
      .catch(() => {})
  }, [])

  const fetchLpus = () => {
    if (!selectedFreelancer) {
      setLpus([])
      return
    }
    api.get(`/lpus/freelancer/${selectedFreelancer}`)
      .then((res) => setLpus(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar a lista.'))
  }

  useEffect(() => {
    fetchLpus()
  }, [selectedFreelancer])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta LPU?')) return
    try {
      await api.delete(`/lpus/${id}`)
      fetchLpus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const handleNew = () => {
    setEditId(null)
    setModalOpen(true)
  }

  const handleEdit = (id: number) => {
    setEditId(id)
    setModalOpen(true)
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">LPUs</Typography>
        <Button variant="contained" onClick={handleNew} disabled={!selectedFreelancer} startIcon={<Add />}>
          Nova LPU
        </Button>
      </Box>

      <TextField
        select
        size="small"
        label="Selecionar Freelancer"
        value={selectedFreelancer}
        onChange={(e) => setSelectedFreelancer(e.target.value)}
        sx={{ mb: 2, minWidth: 250 }}
      >
        <MenuItem value="">Selecione um freelancer</MenuItem>
        {freelancers.map((f) => (
          <MenuItem key={f.id} value={f.id}>{f.firstName} {f.lastName}</MenuItem>
        ))}
      </TextField>

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
            {lpus.map((l) => (
              <TableRow key={l.id} hover>
                <TableCell>{l.nome}</TableCell>
                <TableCell>{l.descricao || '-'}</TableCell>
                <TableCell>{l.valor ? `$${l.valor}` : '-'}</TableCell>
                <TableCell>{l.data || '-'}</TableCell>
                <TableCell>
                  <Chip label={l.status === 'ativo' ? 'Ativo' : 'Inativo'} color={l.status === 'ativo' ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(l.id)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(l.id)}><Delete /></IconButton>
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
        onClose={() => setModalOpen(false)}
        onSaved={fetchLpus}
      />
    </Container>
  )
}
