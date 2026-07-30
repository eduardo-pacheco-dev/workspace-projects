import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import FreelancerList from './pages/freelancers/FreelancerList'
import FreelancerForm from './pages/freelancers/FreelancerForm'
import FreelancerDetail from './pages/freelancers/FreelancerDetail'
import JobList from './pages/jobs/JobList'
import JobForm from './pages/jobs/JobForm'
import JobDetail from './pages/jobs/JobDetail'
import ProposalList from './pages/proposals/ProposalList'
import ProposalForm from './pages/proposals/ProposalForm'
import ProposalDetail from './pages/proposals/ProposalDetail'
import ContractList from './pages/contracts/ContractList'
import ContractForm from './pages/contracts/ContractForm'
import ContractDetail from './pages/contracts/ContractDetail'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/freelancers" element={<FreelancerList />} />
          <Route path="/freelancers/new" element={<FreelancerForm />} />
          <Route path="/freelancers/:id" element={<FreelancerDetail />} />
          <Route path="/freelancers/:id/edit" element={<FreelancerForm />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/new" element={<JobForm />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/edit" element={<JobForm />} />
          <Route path="/proposals" element={<ProposalList />} />
          <Route path="/proposals/new" element={<ProposalForm />} />
          <Route path="/proposals/:id" element={<ProposalDetail />} />
          <Route path="/proposals/:id/edit" element={<ProposalForm />} />
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/contracts/new" element={<ContractForm />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />
          <Route path="/contracts/:id/edit" element={<ContractForm />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
