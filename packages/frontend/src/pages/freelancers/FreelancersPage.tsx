import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, Tab, Box } from '@mui/material'
import FreelancerList from './FreelancerList'
import FreelancerModal from './FreelancerModal'
import JobList from '../jobs/JobList'
import ProposalList from '../proposals/ProposalList'
import ContractList from '../contracts/ContractList'

export default function FreelancersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    return t ? Number(t) : 0
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const handleTabChange = (_: any, v: number) => {
    setTab(v)
    setSearchParams(v ? { tab: String(v) } : {}, { replace: true })
  }

  const handleNew = () => {
    setEditId(null)
    setModalOpen(true)
  }

  const handleEdit = (id: number) => {
    setEditId(id)
    setModalOpen(true)
  }

  const refreshOnSave = () => {
    window.location.reload()
  }

  return (
    <Box>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Freelancers" />
        <Tab label="Jobs" />
        <Tab label="Proposals" />
        <Tab label="Contracts" />
      </Tabs>
      {tab === 0 && <FreelancerList onNew={handleNew} onEdit={handleEdit} />}
      {tab === 1 && <JobList />}
      {tab === 2 && <ProposalList />}
      {tab === 3 && <ContractList />}
      <FreelancerModal open={modalOpen} editId={editId} onClose={() => setModalOpen(false)} onSaved={refreshOnSave} />
    </Box>
  )
}
