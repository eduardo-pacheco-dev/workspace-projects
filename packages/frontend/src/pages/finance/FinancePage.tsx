import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, Tab, Box } from '@mui/material'
import OverviewPage from './OverviewPage'
import EntriesPage from './EntriesPage'
import ReportsPage from './ReportsPage'
import LimitsPage from './LimitsPage'

export default function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const t = searchParams.get('tab')
    return t ? Number(t) : 0
  })

  const handleTabChange = (_: any, v: number) => {
    setTab(v)
    setSearchParams(v ? { tab: String(v) } : {}, { replace: true })
  }

  return (
    <Box>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Visão Geral" />
        <Tab label="Lançamentos" />
        <Tab label="Relatórios" />
        <Tab label="Limites de Gastos" />
      </Tabs>
      {tab === 0 && <OverviewPage />}
      {tab === 1 && <EntriesPage />}
      {tab === 2 && <ReportsPage />}
      {tab === 3 && <LimitsPage />}
    </Box>
  )
}
