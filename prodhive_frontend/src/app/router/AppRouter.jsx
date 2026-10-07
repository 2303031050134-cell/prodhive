import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/store/authStore';
import AppLayout from '@/app/layouts/AppLayout';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import Dashboard from '@/features/dashboard/pages/Dashboard';
import ProjectsPage from '@/features/project/pages/ProjectsPage';
import BoardPage from '@/features/project/pages/BoardPage';
import BacklogPage from '@/features/project/pages/BacklogPage';
import SprintsPage from '@/features/sprint/pages/SprintsPage';
import AnalyticsPage from '@/features/analytics/pages/AnalyticsPage';
import RoadmapPage from '@/features/project/pages/RoadmapPage';
import PullRequestsPage from '@/features/pullrequest/pages/PullRequestsPage';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId/board" element={<BoardPage />} />
          <Route path="projects/:projectId/backlog" element={<BacklogPage />} />
          <Route path="projects/:projectId/sprints" element={<SprintsPage />} />
          <Route path="projects/:projectId/analytics" element={<AnalyticsPage />} />
          <Route path="projects/:projectId/roadmap" element={<RoadmapPage />} />
          <Route path="projects/:projectId/pull-requests" element={<PullRequestsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
