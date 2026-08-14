import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, Tab, Box } from '@mui/material'
import FreelancerModal from './FreelancerModal'
import LpuList from '../lpu/LpuList'
import CollaboratorsPage from '../collaborators/CollaboratorsPage'
import TeamsTab from '../teams/TeamsTab'

export default function FreelancersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    return t ? Number(t) : 0
  })
  const [freelancerModal, setFreelancerModal] = useState({ open: false, editId: null as number | null })

  const handleTabChange = (_: any, v: number) => {
    setTab(v)
    setSearchParams(v ? { tab: String(v) } : {}, { replace: true })
  }

  const refresh = () => window.location.reload()

  return (
    <Box>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Todos" />
        <Tab label="Freelancers" />
        <Tab label="Colaboradores" />
        <Tab label="Equipe" />
        <Tab label="LPU" />
      </Tabs>
      {tab === 0 && (
        <CollaboratorsPage
          onNew={() => setFreelancerModal({ open: true, editId: null })}
          onEdit={(id) => setFreelancerModal({ open: true, editId: id })}
        />
      )}
      {tab === 1 && (
        <CollaboratorsPage
          isFreelancer={true}
          onNew={() => setFreelancerModal({ open: true, editId: null })}
          onEdit={(id) => setFreelancerModal({ open: true, editId: id })}
        />
      )}
      {tab === 2 && (
        <CollaboratorsPage
          isFreelancer={false}
          onNew={() => setFreelancerModal({ open: true, editId: null })}
          onEdit={(id) => setFreelancerModal({ open: true, editId: id })}
        />
      )}
      {tab === 3 && <TeamsTab />}
      {tab === 4 && <LpuList />}
      <FreelancerModal
        open={freelancerModal.open}
        editId={freelancerModal.editId}
        defaultType={tab === 2 ? 'colaborador' : 'freelancer'}
        onClose={() => setFreelancerModal({ open: false, editId: null })}
        onSaved={refresh}
      />
    </Box>
  )
}
