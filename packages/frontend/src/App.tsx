import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
import FreelancerDetail from './pages/freelancers/FreelancerDetail'
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
import NotFound from './pages/errors/NotFound'
import InternalError from './pages/errors/InternalError'
import Unauthorized from './pages/errors/Unauthorized'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/signin" replace />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
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
          <Route path="/freelancers" element={<FreelancersPage />} />
          <Route path="/freelancers/:id" element={<FreelancerDetail />} />
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
        </Route>
      </Routes>
    </AuthProvider>
  )
}
