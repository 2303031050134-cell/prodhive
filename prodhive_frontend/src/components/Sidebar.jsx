import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { AUTH } from '../services/api'

const Icon = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const ICONS = {
  home:    'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  projects:'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  board:   'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  backlog: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  sprint:  'M17 1l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3',
  roadmap: 'M3 12h18M3 6h18M3 18h12',
  pr:      'M18 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 9v6 M18 9a9 9 0 0 1-9 9',
  analytics:'M18 20V10 M12 20V4 M6 20v-7',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  bell:    'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  search:  'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  org:     'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
}

function NavItem({ to, icon, label, end = false }) {
  const { pathname } = useLocation()
  const active = end ? pathname === to : pathname.startsWith(to)
  return (
    <Link to={to} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
      active
        ? 'bg-[var(--bg-surface-2)] text-[var(--text-primary)] font-medium'
        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)]'
    }`}>
      <Icon d={icon} className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`} />
      <span className="truncate">{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const { user, logout, applyOrgContext } = useAuth()
  const { pathname } = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  // Extract projectId from any nested route
  const projectMatch = pathname.match(/\/projects\/(\d+)/)
  const projectId = projectMatch ? projectMatch[1] : null

  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <aside className="w-60 flex flex-col h-full bg-[var(--bg-canvas)] border-r border-[var(--border-subtle)] flex-shrink-0">
      {/* Org switcher */}
      <OrgSwitcher user={user} applyOrgContext={applyOrgContext} toast={toast} navigate={navigate} />

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Global */}
        <div className="space-y-0.5">
          <NavItem to="/app" icon={ICONS.home} label="Dashboard" end />
          <NavItem to="/app/projects" icon={ICONS.projects} label="Projects" />
          <NavItem to="/app/search" icon={ICONS.search} label="Search" />
          <NavItem to="/app/notifications" icon={ICONS.bell} label="Notifications" />
          <NavItem to="/app/organization" icon={ICONS.org} label="Organization" />
        </div>

        {/* Project sub-nav */}
        {projectId && (
          <div>
            <p className="px-3 mb-1 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Project</p>
            <div className="space-y-0.5">
              <NavItem to={`/app/projects/${projectId}/board`} icon={ICONS.board} label="Board" />
              <NavItem to={`/app/projects/${projectId}/backlog`} icon={ICONS.backlog} label="Backlog" />
              <NavItem to={`/app/projects/${projectId}/sprints`} icon={ICONS.sprint} label="Sprints" />
              <NavItem to={`/app/projects/${projectId}/roadmap`} icon={ICONS.roadmap} label="Roadmap" />
              <NavItem to={`/app/projects/${projectId}/pull-requests`} icon={ICONS.pr} label="Pull Requests" />
              <NavItem to={`/app/projects/${projectId}/analytics`} icon={ICONS.analytics} label="Analytics" />
              <NavItem to={`/app/projects/${projectId}/settings`} icon={ICONS.settings} label="Settings" />
            </div>
          </div>
        )}

      </div>

      {/* User */}
      <div className="p-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
          <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user?.fullName}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] truncate">{user?.role}</p>
          </div>
          <button onClick={logout} className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors text-xs" title="Sign out">⎋</button>
        </div>
      </div>
    </aside>
  )
}

function OrgSwitcher({ user, applyOrgContext, toast, navigate }) {
  const [open, setOpen] = useState(false)
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const openMenu = () => {
    setOpen(o => !o)
    if (orgs.length === 0) {
      setLoading(true)
      AUTH.get('/organizations/mine').then(r => setOrgs(r.data)).catch(() => {}).finally(() => setLoading(false))
    }
  }

  const switchTo = async org => {
    if (org.id === user?.orgId) { setOpen(false); return }
    try {
      const { data } = await AUTH.post(`/organizations/${org.id}/switch`)
      applyOrgContext(data.token, data.organization.name)
      toast(`Switched to ${data.organization.name}`)
      setOpen(false)
      navigate('/app')
    } catch (err) {
      toast(err.response?.data?.message || 'Could not switch workspace', 'error')
    }
  }

  return (
    <div className="relative px-2 py-2 border-b border-[var(--border-subtle)]" ref={ref}>
      <button onClick={openMenu} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--bg-surface-2)] transition-colors">
        <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {(user?.orgName || 'ProdHive')[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-bold text-[var(--text-primary)] text-sm truncate">{user?.orgName || 'Select workspace'}</p>
          {user?.orgRole && <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wide">{user.orgRole}</p>}
        </div>
        <span className="text-[var(--text-tertiary)] text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full mt-1 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-30 py-1 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-2 text-xs text-[var(--text-tertiary)]">Loading…</p>
          ) : orgs.length === 0 ? (
            <p className="px-3 py-2 text-xs text-[var(--text-tertiary)]">No workspaces yet.</p>
          ) : orgs.map(o => (
            <button key={o.id} onClick={() => switchTo(o)}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[var(--bg-surface-2)] transition-colors ${o.id === user?.orgId ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-primary)]'}`}>
              <span className="truncate">{o.name}</span>
              {o.id === user?.orgId && <span>✓</span>}
            </button>
          ))}
          <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
            <Link to="/app/organization" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-xs text-[var(--accent-primary)] hover:bg-[var(--bg-surface-2)] transition-colors">
              Manage workspaces →
            </Link>
          </div>
        </div>
      )}
    </div>

  )
}
