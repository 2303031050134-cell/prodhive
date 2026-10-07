import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { CORE } from '../services/api'

const Icon = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

export default function TopBar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const params = useParams()

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showProfile, setShowProfile] = useState(false)
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  const projectMatch = pathname.match(/\/projects\/(\d+)/)
  const projectId = projectMatch ? projectMatch[1] : null

  useEffect(() => {
    CORE.get('/notifications').then(r => {
      setUnread(r.data.filter(n => !n.read).length)
    }).catch(() => {})
  }, [pathname])

  useEffect(() => {
    if (!search.trim() || !projectId) { setSearchResults([]); return }
    const t = setTimeout(() => {
      CORE.get(`/search?projectId=${projectId}&q=${encodeURIComponent(search)}`)
        .then(r => setSearchResults(r.data.slice(0, 6)))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [search, projectId])

  useEffect(() => {
    const h = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  // Breadcrumb
  const crumbs = [{ label: 'ProdHive', to: '/app' }]
  if (pathname.startsWith('/app/projects') && !pathname.includes('/app/projects/')) crumbs.push({ label: 'Projects' })
  if (projectId) {
    crumbs.push({ label: 'Projects', to: '/app/projects' })
    const sub = pathname.split('/').pop()
    if (sub !== projectId) crumbs.push({ label: sub.charAt(0).toUpperCase() + sub.slice(1).replace('-', ' ') })
  }
  if (pathname === '/app/search') crumbs.push({ label: 'Search' })
  if (pathname === '/app/notifications') crumbs.push({ label: 'Notifications' })
  if (pathname === '/app/organization') crumbs.push({ label: 'Organization' })

  return (
    <header className="h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-between px-4 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm overflow-hidden">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[var(--text-tertiary)]">/</span>}
            {c.to ? (
              <Link to={c.to} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{c.label}</Link>
            ) : (
              <span className="text-[var(--text-primary)] font-medium">{c.label}</span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Icon d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35" className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              className="bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded px-8 py-1 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-blue-500/30 placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
              placeholder={projectId ? 'Search issues…' : 'Select a project first'}
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
              disabled={!projectId}
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-72 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded shadow-xl z-50 py-1">
              {searchResults.map(issue => (
                <button key={issue.id} onClick={() => { navigate(`/app/projects/${projectId}/board`); setShowSearch(false); setSearch('') }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--bg-surface-2)] flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{issue.issueKey}</span>
                  <span className="text-xs text-[var(--text-primary)] truncate">{issue.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme */}
        <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)]">
          <Icon d={theme === 'dark' ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z' : 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'} />
        </button>

        {/* Notifications */}
        <Link to="/app/notifications" className="relative p-1.5 rounded hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)]">

          <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />
          {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-primary)]" />}
        </Link>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setShowProfile(v => !v)}
            className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[10px] font-bold">
            {initials}
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded shadow-xl z-50 py-1">
              <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{user?.fullName}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{user?.email}</p>
                <p className="text-[10px] text-[var(--accent-primary)] font-medium mt-0.5">{user?.role}</p>
              </div>
              <button onClick={() => { logout(); navigate('/login') }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-[var(--bg-surface-2)]">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
