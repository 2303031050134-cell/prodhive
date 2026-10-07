import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/store/authStore';
import NotificationPanel from '@/features/notification/NotificationPanel';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/projects', label: 'Projects', icon: '◫' },
];

const PROJECT_NAV = [
  { to: 'board', label: 'Board', icon: '▦' },
  { to: 'backlog', label: 'Backlog', icon: '☰' },
  { to: 'sprints', label: 'Sprints', icon: '↻' },
  { to: 'roadmap', label: 'Roadmap', icon: '⟶' },
  { to: 'pull-requests', label: 'Pull Requests', icon: '⎇' },
  { to: 'analytics', label: 'Analytics', icon: '⌇' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Extract projectId from URL if in project context
  const projectMatch = location.pathname.match(/\/projects\/(\d+)/);
  const projectId = projectMatch ? projectMatch[1] : null;

  useEffect(() => {
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.fullName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">PH</div>
          <span className="sidebar-logo-text">ProdHive</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Main</div>
          {NAV.map(n => (
            <Link key={n.to} to={n.to} className={`sidebar-item ${location.pathname === n.to ? 'active' : ''}`}>
              <span>{n.icon}</span> {n.label}
            </Link>
          ))}
        </div>

        {projectId && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Project</div>
            {PROJECT_NAV.map(n => {
              const fullPath = `/app/projects/${projectId}/${n.to}`;

              return (
                <Link key={n.to} to={fullPath} className={`sidebar-item ${location.pathname.includes(n.to) ? 'active' : ''}`}>
                  <span>{n.icon}</span> {n.label}
                </Link>
              );
            })}
          </div>
        )}

        <div className="sidebar-bottom">
          <div ref={userRef} style={{ position: 'relative' }}>
            <div className="user-chip" onClick={() => setShowUserMenu(v => !v)}>
              <div className="avatar">{initials}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
              </div>
            </div>
            {showUserMenu && (
              <div className="dropdown-menu" style={{ bottom: '100%', top: 'auto', left: 0, right: 'auto', marginBottom: 4 }}>
                <div className="dropdown-item" onClick={() => { logout(); navigate('/login'); }}>
                  ⎋ Sign out
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <header className="topbar">
        <span className="topbar-title">
          {projectId ? `Project #${projectId}` : 'ProdHive'}
        </span>
        <div style={{ flex: 1 }} />
        <div ref={notifRef} className="notif-btn dropdown" style={{ position: 'relative' }}>
          <button className="btn-icon" onClick={() => setShowNotif(v => !v)} style={{ fontSize: 16 }}>
            🔔
            <span className="notif-dot" />
          </button>
          {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}
        </div>
        <div className="avatar" style={{ cursor: 'default' }}>{initials}</div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
