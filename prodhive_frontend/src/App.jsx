import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import DashboardLayout from './components/DashboardLayout'

// Public Landing Page
import LandingPage from './pages/LandingPage'

// Auth pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'

// App pages
import Dashboard from './pages/Dashboard'
import ProjectsPage from './pages/ProjectsPage'
import BoardPage from './pages/BoardPage'
import BacklogPage from './pages/BacklogPage'
import SprintsPage from './pages/SprintsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import RoadmapPage from './pages/RoadmapPage'
import PullRequestsPage from './pages/PullRequestsPage'
import ProjectSettingsPage from './pages/ProjectSettingsPage'
import SearchPage from './pages/SearchPage'
import NotificationsPage from './pages/NotificationsPage'
import OrgPage from './pages/OrgPage'
import JoinPage from './pages/JoinPage'
import IssueDetailsPage from './pages/IssueDetailsPage'

function Guard({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/join/:code" element={<JoinPage />} />

      {/* Protected SaaS App Dashboard */}
      <Route path="/app" element={<Guard><DashboardLayout /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId/board" element={<BoardPage />} />
        <Route path="issues/:issueId" element={<IssueDetailsPage />} />
        <Route path="projects/:projectId/backlog" element={<BacklogPage />} />
        <Route path="projects/:projectId/sprints" element={<SprintsPage />} />
        <Route path="projects/:projectId/analytics" element={<AnalyticsPage />} />
        <Route path="projects/:projectId/roadmap" element={<RoadmapPage />} />
        <Route path="projects/:projectId/pull-requests" element={<PullRequestsPage />} />
        <Route path="projects/:projectId/settings" element={<ProjectSettingsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="organization" element={<OrgPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
