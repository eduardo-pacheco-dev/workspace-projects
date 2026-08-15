import { useState, useEffect, useCallback } from 'react'
import { Alert, Button, Container, Paper, Tab, Tabs } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useUserModules } from '../../hooks/useUserModules'
import { formatDateTime } from '../../utils/format'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import InfoFields from '../../components/ui/InfoFields'
import ProjectHeaderCard from '../../components/projects/ProjectHeaderCard'
import ProjectStationsTab from '../../components/projects/ProjectStationsTab'
import ProjectRadioLinksTab from '../../components/projects/ProjectRadioLinksTab'
import ProjectDocumentsTab from '../../components/projects/ProjectDocumentsTab'
import ProjectCommentsTab from '../../components/projects/ProjectCommentsTab'
import ProjectModal from './ProjectModal'
import ProjectFileExplorer from './ProjectFileExplorer'
import PdcaPage from '../pdca/PdcaPage'
import { Project, formatProjectDate } from './projectsTypes'

interface ProjectTab {
  label: string
  value: number
  module?: string
}

const TAB_DEFS: ProjectTab[] = [
  { label: 'Overview', value: 0 },
  { label: 'Estações', value: 1, module: '/stations' },
  { label: 'Enlaces de Rádio', value: 2, module: '/radio-links' },
  { label: 'Documentos', value: 3 },
  { label: 'Anexos', value: 4, module: '/attachments' },
  { label: 'PDCA', value: 5, module: '/pdca' },
  { label: 'Comentários', value: 6, module: '/comments' },
]

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const modules = useUserModules()
  const projectId = Number(id)
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}`)
      setProject(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível carregar o projeto.')
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const canAccessModule = (module?: string) =>
    !module || user?.role === 'master' || modules.includes(module)

  const visibleTabs = TAB_DEFS.filter((t) => canAccessModule(t.module))

  useEffect(() => {
    const current = TAB_DEFS.find((t) => t.value === tab)
    if (current && !canAccessModule(current.module)) setTab(0)
  }, [tab, modules, user?.role])

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${projectId}`)
      navigate('/projects')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível excluir. Tente novamente.')
    }
  }

  const infoFields = project
    ? [
        { label: 'Código', value: project.codigo || '-' },
        { label: 'Cliente', value: project.cliente || '-' },
        { label: 'Operadora', value: project.operadora || '-' },
        { label: 'Responsável', value: project.responsavel || '-' },
        { label: 'Data de Início', value: formatProjectDate(project.dataInicio) },
        { label: 'Data de Término', value: formatProjectDate(project.dataFim) || 'Indeterminado' },
        { label: 'Descrição', value: project.descricao || '-' },
        { label: 'Observações', value: project.observacoes || '-' },
        { label: 'Criado em', value: formatDateTime(project.createdAt ?? '') },
        { label: 'Atualizado em', value: formatDateTime(project.updatedAt ?? '') },
      ]
    : []

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')} sx={{ mb: 2 }}>
        Voltar
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {project && (
        <>
          <ProjectHeaderCard
            project={project}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirmDelete(true)}
          />

          <Paper sx={{ mb: 3 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
              {visibleTabs.map((t) => (
                <Tab key={t.value} label={t.label} />
              ))}
            </Tabs>
          </Paper>

          {tab === 0 && <InfoFields title="Informações do Projeto" fields={infoFields} />}
          {tab === 1 && <ProjectStationsTab projectId={projectId} onError={setError} />}
          {tab === 2 && <ProjectRadioLinksTab projectId={projectId} onError={setError} />}
          {tab === 3 && <ProjectDocumentsTab projectId={projectId} onError={setError} />}
          {tab === 4 && <ProjectFileExplorer projectId={projectId} />}
          {tab === 5 && (
            <Paper sx={{ p: 3 }}>
              <PdcaPage projectId={projectId} embedded />
            </Paper>
          )}
          {tab === 6 && <ProjectCommentsTab projectId={projectId} onError={setError} />}

          <ProjectModal
            open={editOpen}
            editId={projectId}
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
        title="Excluir projeto"
        message={`Tem certeza que deseja excluir o projeto "${project?.nome}"?`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Container>
  )
}
