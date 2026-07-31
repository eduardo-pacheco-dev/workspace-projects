import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import SignIn from './pages/auth/SignIn'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import FreelancersPage from './pages/freelancers/FreelancersPage'
import FreelancerDetail from './pages/freelancers/FreelancerDetail'
import JobDetail from './pages/jobs/JobDetail'
import ProposalForm from './pages/proposals/ProposalForm'
import ProposalDetail from './pages/proposals/ProposalDetail'
import ContractForm from './pages/contracts/ContractForm'
import ContractDetail from './pages/contracts/ContractDetail'
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
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/500" element={<InternalError />} />
        <Route path="/401" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/freelancers" element={<FreelancersPage />} />
          <Route path="/freelancers/:id" element={<FreelancerDetail />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/proposals/new" element={<ProposalForm />} />
          <Route path="/proposals/:id" element={<ProposalDetail />} />
          <Route path="/proposals/:id/edit" element={<ProposalForm />} />
          <Route path="/contracts/new" element={<ContractForm />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/contracts/:id/edit" element={<ContractForm />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
