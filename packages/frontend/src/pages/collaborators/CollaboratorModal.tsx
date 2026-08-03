import { useState, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  MenuItem,
} from '@mui/material'
import { z } from 'zod'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'

const collaboratorSchema = z.object({
  nome: z.string().min(1, 'Informe o nome.'),
  cpf: z.string().optional(),
  cargo: z.string().optional(),
  email: z.string().email('Email inválido.').or(z.literal('')).optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  dataAdmissao: z.string().optional(),
  status: z.enum(['ativo', 'inativo']),
})

const editSchema = collaboratorSchema.partial().refine(
  (data) => data.nome !== undefined || data.status !== undefined,
  { message: 'Informe ao menos um campo para atualizar.' },
)

interface Props {
  open: boolean
  editId: number | null
  onClose: () => void
  onSaved: () => void
}

export default function CollaboratorModal({ open, editId, onClose, onSaved }: Props) {
  const isEdit = Boolean(editId)
  const { showToast } = useToast()

  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [cargo, setCargo] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [dataAdmissao, setDataAdmissao] = useState('')
  const [status, setStatus] = useState('ativo')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/collaborators/${editId}`)
        .then((res) => {
          const data = res.data
          setNome(data.nome || '')
          setCpf(data.cpf || '')
          setCargo(data.cargo || '')
          setEmail(data.email || '')
          setTelefone(data.telefone || '')
          setEndereco(data.endereco || '')
          setCidade(data.cidade || '')
          setUf(data.uf || '')
          setDataAdmissao(data.dataAdmissao || '')
          setStatus(data.status || 'ativo')
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const data = { nome, cpf, cargo, email, telefone, endereco, cidade, uf, dataAdmissao, status }
    const schema = isEdit ? editSchema : collaboratorSchema
    const result = schema.safeParse(data)
    if (!result.success) {
      const fieldErrs: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const key = String(issue.path[0])
        if (!fieldErrs[key]) fieldErrs[key] = issue.message
      })
      setFieldErrors(fieldErrs)
      return
    }

    const payload: any = { nome, status }
    if (cpf) payload.cpf = cpf
    if (cargo) payload.cargo = cargo
    if (email) payload.email = email
    if (telefone) payload.telefone = telefone
    if (endereco) payload.endereco = endereco
    if (cidade) payload.cidade = cidade
    if (uf) payload.uf = uf
    if (dataAdmissao) payload.dataAdmissao = dataAdmissao

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/collaborators/${editId}`, payload)
      } else {
        await api.post('/collaborators', payload)
      }
      onSaved()
      handleClose()
      showToast(isEdit ? 'Colaborador atualizado com sucesso.' : 'Colaborador criado com sucesso.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setFieldErrors({})
    setNome('')
    setCpf('')
    setCargo('')
    setEmail('')
    setTelefone('')
    setEndereco('')
    setCidade('')
    setUf('')
    setDataAdmissao('')
    setStatus('ativo')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Nome"
            value={nome}
            onChange={(e) => { setNome(e.target.value); clearFieldError('nome') }}
            margin="normal"
            required
            error={!!fieldErrors.nome}
            helperText={fieldErrors.nome}
          />
          <TextField
            fullWidth
            label="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
            margin="normal"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
          <TextField
            fullWidth
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="UF"
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Data de Admissão"
            type="date"
            value={dataAdmissao}
            onChange={(e) => setDataAdmissao(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          {isEdit && (
            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              margin="normal"
            >
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
