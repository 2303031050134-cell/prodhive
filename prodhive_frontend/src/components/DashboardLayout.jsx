import { Outlet, Navigate, useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardLayout() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  // Brand-new users (or anyone who left their last org) land on the workspace picker first,
  // instead of hitting a Dashboard with nothing to show.
  const onboardingRoutes = ['/app/organization']
  if (!user.orgId && !onboardingRoutes.includes(location.pathname)) {
    return <Navigate to="/app/organization" replace />
  }


  return (
    <div className="flex h-screen w-full bg-[var(--bg-canvas)] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
