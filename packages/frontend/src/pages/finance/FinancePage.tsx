import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, Tab, Box } from '@mui/material'
import OverviewPage from './OverviewPage'
import AccountsPage from './AccountsPage'
import CardsPage from './CardsPage'
import EntriesPage from './EntriesPage'
import ReportsPage from './ReportsPage'
import LimitsPage from './LimitsPage'
import CategoriesPage from './CategoriesPage'

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
        <Tab label="Contas" />
        <Tab label="Cartões" />
        <Tab label="Lançamentos" />
        <Tab label="Relatórios" />
        <Tab label="Limites de Gastos" />
        <Tab label="Configurações" />
      </Tabs>
      {tab === 0 && <OverviewPage />}
      {tab === 1 && <AccountsPage />}
      {tab === 2 && <CardsPage />}
      {tab === 3 && <EntriesPage />}
      {tab === 4 && <ReportsPage />}
      {tab === 5 && <LimitsPage />}
      {tab === 6 && <CategoriesPage />}
    </Box>
  )
}
