import { useState, useEffect, useCallback } from 'react'
import { Button, Container, Grid, Paper, Tab, Tabs } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import { formatDateTime } from '../../utils/format'
import DeleteModal from '../../components/modals/DeleteModal'
import ErrorState from '../../components/ui/ErrorState'
import InfoCard from '../../components/ui/InfoCard'
import PageLoader from '../../components/ui/PageLoader'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/companies/${companyId}`)
      setCompany(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar a empresa.')
    } finally {
      setLoading(false)
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
      const message = err.response?.data?.message || 'Não foi possível excluir. Tente novamente.'
      setError(message)
      showToast(message, 'error')
    }
  }

  const sections = company
    ? [
        {
          title: 'Contato',
          fields: [
            { label: 'CNPJ', value: company.cnpj || '-' },
            { label: 'E-mail', value: company.email || '-' },
            { label: 'Telefone', value: company.telefone || '-' },
          ],
        },
        {
          title: 'Endereço',
          fields: [
            { label: 'Endereço', value: company.endereco || '-' },
            { label: 'Cidade / UF', value: `${company.cidade || '-'}${company.uf ? `/${company.uf}` : ''}` },
          ],
        },
        {
          title: 'Registro',
          fields: [
            { label: 'Observações', value: company.observacoes || '-' },
            { label: 'Criado em', value: formatDateTime(company.createdAt) },
            { label: 'Atualizado em', value: formatDateTime(company.updatedAt) },
          ],
        },
      ]
    : []

  return (
    <Container sx={{ mt: 3, mb: 6 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/companies')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <ErrorState message={error} />}

      {loading && <PageLoader py={10} />}

      {company && (
        <>
          <CompanyHeaderCard
            company={company}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirmDelete(true)}
          />

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              mt: 3,
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 2,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              sx={{
                px: 2,
                '& .MuiTabs-indicator': { bgcolor: 'rgb(0, 21, 68)' },
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                '& .Mui-selected': { color: 'rgb(0, 21, 68)' },
              }}
            >
              <Tab label="Overview" />
              <Tab label="Colaboradores" />
              <Tab label="Projetos" />
              <Tab label="Anexos" />
              <Tab label="Comentários" />
              <Tab label="Mapa" />
            </Tabs>
          </Paper>

          {tab === 0 && (
            <Grid container spacing={3}>
              {sections.map((section) => (
                <Grid item xs={12} md={6} key={section.title}>
                  <InfoCard title={section.title} fields={section.fields} />
                </Grid>
              ))}
            </Grid>
          )}
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

      <DeleteModal
        open={confirmDelete}
        title="Excluir empresa"
        message={`Tem certeza que deseja excluir a empresa "${company?.nome}"? Esta ação não poderá ser desfeita.`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
