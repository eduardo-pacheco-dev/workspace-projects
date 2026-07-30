import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, Tab, Box } from '@mui/material'
import FreelancerList from './FreelancerList'
import FreelancerModal from './FreelancerModal'
import JobList from '../jobs/JobList'
import JobModal from '../jobs/JobModal'
import ProposalList from '../proposals/ProposalList'
import ContractList from '../contracts/ContractList'
import LpuList from '../lpu/LpuList'

export default function FreelancersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    return t ? Number(t) : 0
  })
  const [freelancerModal, setFreelancerModal] = useState({ open: false, editId: null as number | null })
  const [jobModal, setJobModal] = useState({ open: false, editId: null as number | null })

  const handleTabChange = (_: any, v: number) => {
    setTab(v)
    setSearchParams(v ? { tab: String(v) } : {}, { replace: true })
  }

  const refresh = () => window.location.reload()

  return (
    <Box>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Freelancers" />
        <Tab label="Jobs" />
        <Tab label="Proposals" />
        <Tab label="Contracts" />
        <Tab label="LPU" />
      </Tabs>
      {tab === 0 && (
        <FreelancerList
          onNew={() => setFreelancerModal({ open: true, editId: null })}
          onEdit={(id) => setFreelancerModal({ open: true, editId: id })}
        />
      )}
      {tab === 1 && (
        <JobList
          onNew={() => setJobModal({ open: true, editId: null })}
          onEdit={(id) => setJobModal({ open: true, editId: id })}
        />
      )}
      {tab === 2 && <ProposalList />}
      {tab === 3 && <ContractList />}
      {tab === 4 && <LpuList />}
      <FreelancerModal
        open={freelancerModal.open}
        editId={freelancerModal.editId}
        onClose={() => setFreelancerModal({ open: false, editId: null })}
        onSaved={refresh}
      />
      <JobModal
        open={jobModal.open}
        editId={jobModal.editId}
        onClose={() => setJobModal({ open: false, editId: null })}
        onSaved={refresh}
      />
    </Box>
  )
}
