import { useState, useEffect } from 'react'
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { ToastProvider } from './contexts/ToastContext'
import api from './services/api'
import { DEFAULT_USER_MODULES } from './pages/settings/roleModules'
import Layout from './components/Layout'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/users/UsersPage'
import ServiceOrdersPage from './pages/service-orders/ServiceOrdersPage'
import ServiceOrderDetail from './pages/service-orders/ServiceOrderDetail'
import FreelancersPage from './pages/freelancers/FreelancersPage'
import CollaboratorDetail from './pages/collaborators/CollaboratorDetail'
import JobDetail from './pages/jobs/JobDetail'
import ProposalForm from './pages/proposals/ProposalForm'
import ProposalDetail from './pages/proposals/ProposalDetail'
import ContractForm from './pages/contracts/ContractForm'
import ContractDetail from './pages/contracts/ContractDetail'
import FinancePage from './pages/finance/FinancePage'
import AccountDetailsPage from './pages/finance/AccountDetailsPage'
import CardDetailsPage from './pages/finance/CardDetailsPage'
import StationsPage from './pages/stations/StationsPage'
import StationDetailsPage from './pages/stations/StationDetailsPage'
import RadioLinksPage from './pages/radio-links/RadioLinksPage'
import RadioLinkDetailsPage from './pages/radio-links/RadioLinkDetailsPage'
import ProjectsPage from './pages/projects/ProjectsPage'
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage'
import ClientsPage from './pages/clients/ClientsPage'
import ClientDetailsPage from './pages/clients/ClientDetailsPage'
import SchedulePage from './pages/schedule/SchedulePage'
import TasksPage from './pages/tasks/TasksPage'
import TaskDetail from './pages/tasks/TaskDetail'
import PdcaPage from './pages/pdca/PdcaPage'
import PdcaDetail from './pages/pdca/PdcaDetail'
import MsProjectPage from './pages/ms-project/MsProjectPage'
import MsProjectDetailPage from './pages/ms-project/MsProjectDetail'
import SettingsPage from './pages/settings/SettingsPage'
import CompaniesPage from './pages/companies/CompaniesPage'
import CompanyDetailPage from './pages/companies/CompanyDetailPage'
import ProfilePage from './pages/users/ProfilePage'
import NotFound from './pages/errors/NotFound'
import InternalError from './pages/errors/InternalError'
import Unauthorized from './pages/errors/Unauthorized'

const USER_ALWAYS_ALLOWED = ['/', '/profile']

function ProtectedLayout() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [userModules, setUserModules] = useState<string[]>(DEFAULT_USER_MODULES)

  useEffect(() => {
    if (!isAuthenticated) return
    api
      .get('/settings')
      .then((res) => {
        const raw = res.data?.role_modules_user
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) setUserModules(parsed)
          } catch {
            setUserModules(DEFAULT_USER_MODULES)
          }
        }
      })
      .catch(() => {})
  }, [isAuthenticated])

  if (!isAuthenticated) return <Navigate to="/signin" replace />
  const isMaster = user?.role === 'master'
  const isAllowed =
    isMaster ||
    USER_ALWAYS_ALLOWED.includes(location.pathname) ||
    userModules.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))
  if (!isAllowed) return <Navigate to="/" replace />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

function MasterOnlyRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (user?.role !== 'master') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ProjectProvider>
        <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/500" element={<InternalError />} />
        <Route path="/401" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/service-orders" element={<ServiceOrdersPage />} />
          <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
          <Route path="/collaborators" element={<FreelancersPage />} />
          <Route path="/collaborators/:id" element={<CollaboratorDetail />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/proposals/new" element={<ProposalForm />} />
          <Route path="/proposals/:id" element={<ProposalDetail />} />
          <Route path="/proposals/:id/edit" element={<ProposalForm />} />
          <Route path="/contracts/new" element={<ContractForm />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/contracts/:id/edit" element={<ContractForm />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/finance/accounts/:id" element={<AccountDetailsPage />} />
          <Route path="/finance/cards/:id" element={<CardDetailsPage />} />
          <Route path="/stations" element={<StationsPage />} />
          <Route path="/stations/:id" element={<StationDetailsPage />} />
          <Route path="/radio-links" element={<RadioLinksPage />} />
          <Route path="/radio-links/:id" element={<RadioLinkDetailsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/pdca" element={<PdcaPage />} />
          <Route path="/pdca/:id" element={<PdcaDetail />} />
          <Route path="/ms-project" element={<MsProjectPage />} />
          <Route path="/ms-project/:id" element={<MsProjectDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/companies" element={<MasterOnlyRoute><CompaniesPage /></MasterOnlyRoute>} />
          <Route path="/companies/:id" element={<MasterOnlyRoute><CompanyDetailPage /></MasterOnlyRoute>} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        </Routes>
        </ProjectProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
