import { useState, useEffect, FormEvent } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Typography,
  InputAdornment,
} from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import TextField from '../../components/ui/TextField'
import SelectField from '../../components/ui/SelectField'
import Button from '../../components/ui/Button'
import { formatPhone } from '../../utils/phone'
import { roleOptions, RoleType } from '../settings/roleModules'
import { createUserSchema, updateUserSchema } from './userSchemas'
import PasswordField from '../../components/ui/PasswordField'

interface UserModalProps {
  open: boolean
  editId?: number | null
  onClose: () => void
  onSaved: () => void
}

const STEPS = [{ label: 'Identificação' }, { label: 'Acesso e Perfil' }, { label: 'Finalização' }]

export default function UserModal({ open, editId, onClose, onSaved }: UserModalProps) {
  const isEdit = Boolean(editId)
  const { user: currentUser } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('inactive')
  const [role, setRole] = useState<RoleType>('user')
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [companies, setCompanies] = useState<{ id: number; nome: string }[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const isMasterUser = currentUser?.role === 'master'
  const showMasterOption = isMasterUser || role === 'master'
  const isSelf = isEdit && currentUser != null && String(editId) === String(currentUser.id)
  const isLastStep = activeStep === STEPS.length - 1
  const availableCompanies = isMasterUser
    ? companies
    : currentUser?.companyId != null
      ? [{ id: currentUser.companyId, nome: currentUser.companyName || '' }]
      : []

  useEffect(() => {
    if (!open) return
    setActiveStep(0)
    setStepError('')
    if (isMasterUser) {
      api
        .get('/companies', { params: { limit: 100, sortBy: 'nome', sortOrder: 'ASC' } })
        .then((res) => {
          const d = res.data
          setCompanies(Array.isArray(d) ? d : d.data ?? [])
        })
        .catch(() => {})
    } else if (currentUser?.companyId != null) {
      setCompanies([{ id: currentUser.companyId, nome: currentUser.companyName || '' }])
      if (!isEdit) setCompanyId(currentUser.companyId)
    }
  }, [open, isMasterUser, isEdit, currentUser?.companyId, currentUser?.companyName])

  useEffect(() => {
    if (open && editId) {
      setLoading(true)
      api
        .get(`/users/${editId}`)
        .then((res) => {
          const data = res.data
          setName(data.name || '')
          setLastName(data.lastName || '')
          setEmail(data.email || '')
          setPhone(data.phone ? formatPhone(data.phone) : '')
          setStatus(data.status || 'inactive')
          setRole((data.role as RoleType) || 'user')
          setCompanyId(data.companyId ?? null)
        })
        .catch((err) => setError(err.response?.data?.message || 'Não foi possível carregar os dados.'))
        .finally(() => setLoading(false))
    }
  }, [open, editId])

  const clearFieldError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const buildPayload = () => {
    const payload: any = { name, lastName, email, phone: phone.replace(/\D/g, ''), role }
    payload.companyId = role === 'master' ? null : companyId
    if (password) payload.password = password
    if (isEdit) payload.status = status
    return payload
  }

  const validateStep = () => {
    const missing: string[] = []
    if (activeStep === 0) {
      if (!name.trim()) missing.push('Nome')
      if (!lastName.trim()) missing.push('Sobrenome')
      if (!email.trim()) missing.push('Email')
      if (!phone.trim()) missing.push('Telefone')
    } else if (activeStep === 1) {
      if (!isEdit) {
        if (!password) missing.push('Senha')
        if (!confirmPassword) missing.push('Confirmação de senha')
      }
      if (!role) missing.push('Perfil')
      if (role !== 'master' && !companyId) missing.push('Empresa')
    }

    if (missing.length) {
      setStepError(`Preencha os campos obrigatórios: ${missing.join(', ')}.`)
      return false
    }
    setStepError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStepError('')
    setActiveStep((prev) => Math.max(0, prev - 1))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isLastStep) {
      handleNext()
      return
    }
    if (!validateStep()) return

    setError('')
    setFieldErrors({})

    const data = {
      name,
      lastName,
      email,
      phone: phone.replace(/\D/g, ''),
      password: password || undefined,
      confirmPassword: confirmPassword || undefined,
      role,
      companyId: role === 'master' ? null : companyId,
    }

    const schema = isEdit ? updateUserSchema : createUserSchema
    const result = schema.safeParse(data)
    if (!result.success) {
      setFieldErrors(
        Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message])),
      )
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/users/${editId}`, buildPayload())
      } else {
        await api.post('/users', buildPayload())
      }
      onSaved()
      handleClose()
      showToast(isEdit ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setError('')
    setStepError('')
    setFieldErrors({})
    setName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setStatus('inactive')
    setRole('user')
    setCompanyId(null)
    setShowPassword(false)
    setActiveStep(0)
    onClose()
  }

  const toggleShowPassword = () => setShowPassword((prev) => !prev)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        <DialogContent>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              my: 2,
              '& .MuiStepConnector-line': { borderColor: 'divider' },
              '& .MuiStepLabel-label': { fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 },
              '& .MuiStepLabel-label.Mui-active': { fontWeight: 700, color: 'rgb(0, 21, 68)' },
              '& .MuiStepLabel-label.Mui-completed': { fontWeight: 600, color: 'text.primary' },
              '& .MuiStepIcon-root.Mui-active': { color: 'rgb(0, 21, 68)' },
              '& .MuiStepIcon-root.Mui-completed': { color: 'rgb(0, 21, 68)' },
              '& .MuiStepIcon-text': { fontWeight: 600 },
            }}
          >
            {STEPS.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            Passo {activeStep + 1} de {STEPS.length} — {STEPS[activeStep].label}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {stepError && <Alert severity="warning" sx={{ mb: 2 }}>{stepError}</Alert>}

          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearFieldError('name')
                  }}
                  margin="normal"
                  required
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Sobrenome"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value)
                    clearFieldError('lastName')
                  }}
                  margin="normal"
                  required
                  error={!!fieldErrors.lastName}
                  helperText={fieldErrors.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearFieldError('email')
                  }}
                  margin="normal"
                  required
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Telefone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatPhone(e.target.value))
                    clearFieldError('phone')
                  }}
                  margin="normal"
                  required
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone}
                  placeholder="(11) 99999-9999"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              {!isEdit && (
                <>
                  <Grid item xs={12} sm={6}>
                    <PasswordField
                      label="Senha"
                      value={password}
                      onChange={(value) => {
                        setPassword(value)
                        clearFieldError('password')
                      }}
                      showPassword={showPassword}
                      onToggleShow={toggleShowPassword}
                      required
                      error={fieldErrors.password}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PasswordField
                      label="Confirmar Senha"
                      value={confirmPassword}
                      onChange={(value) => {
                        setConfirmPassword(value)
                        clearFieldError('confirmPassword')
                      }}
                      showPassword={showPassword}
                      onToggleShow={toggleShowPassword}
                      required
                      error={fieldErrors.confirmPassword}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <SelectField
                  label="Perfil"
                  value={role}
                  onChange={(value) => {
                    setRole(value as RoleType)
                    clearFieldError('role')
                  }}
                  margin="normal"
                  disabled={isEdit && role === 'master'}
                  error={!!fieldErrors.role}
                  helperText={
                    fieldErrors.role ||
                    (isEdit && role === 'master'
                      ? 'O perfil master não pode ser alterado para usuário.'
                      : isEdit && !showMasterOption
                        ? 'Perfil master é exclusivo do administrador geral.'
                        : undefined)
                  }
                  options={roleOptions
                    .filter((o) => o.value !== 'master' || showMasterOption)
                    .map((o) => ({ value: o.value, label: o.label }))}
                />
              </Grid>
              {role !== 'master' && (
                <Grid item xs={12}>
                  <SelectField
                    label="Empresa"
                    value={companyId != null ? String(companyId) : ''}
                    onChange={(value) => {
                      setCompanyId(value ? Number(value) : null)
                      clearFieldError('companyId')
                    }}
                    margin="normal"
                    required
                    disabled={!isMasterUser}
                    error={!!fieldErrors.companyId}
                    helperText={
                      fieldErrors.companyId ||
                      (!isMasterUser
                        ? 'Usuário não-master só pode criar usuários para a própria empresa.'
                        : 'Usuário não-master deve estar vinculado a uma empresa.')
                    }
                    options={availableCompanies.map((c) => ({ value: String(c.id), label: c.nome }))}
                  />
                </Grid>
              )}
            </Grid>
          )}

          {activeStep === 2 && (
            isEdit ? (
              <SelectField
                label="Status"
                value={status}
                onChange={setStatus}
                margin="normal"
                required
                disabled={isEdit && (role === 'master' || isSelf)}
                helperText={
                  isEdit && role === 'master'
                    ? 'O administrador master não pode ser desativado.'
                    : isEdit && isSelf
                      ? 'Não é possível desativar o próprio usuário.'
                      : undefined
                }
                options={[
                  { value: 'active', label: 'Ativo' },
                  { value: 'inactive', label: 'Inativo' },
                ]}
              />
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                Novo usuário entra como <strong>inativo</strong> até ser ativado.
              </Alert>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0 || loading}>
              Voltar
            </Button>
            {isLastStep ? (
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Salvar' : 'Criar')}
              </Button>
            ) : (
              <Button type="submit" variant="contained" disabled={loading}>
                Próximo
              </Button>
            )}
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
