import { useState, useEffect, useCallback } from 'react'
import { Alert, Button, Container, Tab, Tabs } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { formatDateTime } from '../../utils/format'
import ConfirmDialog from '../../components/ConfirmDialog'
import InfoFields from '../../components/stations/InfoFields'
import CompanyModal from './CompanyModal'
import CompanyMembersTab from './CompanyMembersTab'
import CompanyMapTab from './CompanyMapTab'
import CompanyProjectsTab from './CompanyProjectsTab'
import CompanyHeaderCard from '../../components/companies/CompanyHeaderCard'
import CompanyAttachmentsTab from '../../components/companies/CompanyAttachmentsTab'
import CompanyCommentsTab from '../../components/companies/CompanyCommentsTab'
import { Company } from './companiesTypes'

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const companyId = Number(id)
  const [tab, setTab] = useState(0)
  const [company, setCompany] = useState<Company | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = useCallback(async () => {
    setError('')
    try {
      const res = await api.get(`/companies/${companyId}`)
      setCompany(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a empresa.')
    }
  }, [companyId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    try {
      await api.delete(`/companies/${companyId}`)
      showToast('Empresa excluída com sucesso.')
      navigate('/companies')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const infoFields = company
    ? [
        { label: 'CNPJ', value: company.cnpj || '-' },
        { label: 'E-mail', value: company.email || '-' },
        { label: 'Telefone', value: company.telefone || '-' },
        { label: 'Endereço', value: company.endereco || '-' },
        { label: 'Cidade / UF', value: `${company.cidade || '-'}${company.uf ? `/${company.uf}` : ''}` },
        { label: 'Observações', value: company.observacoes || '-' },
        { label: 'Criado em', value: formatDateTime(company.createdAt) },
        { label: 'Atualizado em', value: formatDateTime(company.updatedAt) },
      ]
    : []

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/companies')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {company && (
        <>
          <CompanyHeaderCard
            company={company}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirmDelete(true)}
          />

          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tab label="Overview" />
            <Tab label="Colaboradores" />
            <Tab label="Projetos" />
            <Tab label="Anexos" />
            <Tab label="Comentários" />
            <Tab label="Mapa" />
          </Tabs>

          {tab === 0 && <InfoFields title="Informações da Empresa" fields={infoFields} />}
          {tab === 1 && <CompanyMembersTab companyId={companyId} />}
          {tab === 2 && <CompanyProjectsTab companyId={companyId} />}
          {tab === 3 && <CompanyAttachmentsTab companyId={companyId} />}
          {tab === 4 && <CompanyCommentsTab companyId={companyId} />}
          {tab === 5 && <CompanyMapTab company={company} />}

          <CompanyModal
            open={editOpen}
            editId={companyId}
            onClose={() => setEditOpen(false)}
            onSaved={() => {
              setEditOpen(false)
              fetchData()
            }}
          />
        </>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir empresa"
        message={`Tem certeza que deseja excluir a empresa "${company?.nome}"?`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
