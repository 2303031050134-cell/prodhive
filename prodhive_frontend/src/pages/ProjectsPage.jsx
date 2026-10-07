import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CORE } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, Empty } from '../components/ui'

const CAN_CREATE_ROLES = { org: ['OWNER', 'ADMIN'], global: ['ADMIN', 'PROJECT_MANAGER'] }

function CreateModal({ orgId, onClose, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ name: '', key: '', description: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await CORE.post('/projects', { ...form, organizationId: orgId })
      toast('Project created')
      onCreated(data)
      onClose()
    } catch (err) { toast(err.response?.data?.message || 'Failed to create project', 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="New Project" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name"><input className="plane-input w-full" placeholder="My Project" value={form.name} onChange={set('name')} required autoFocus /></Field>
        <Field label="Key (e.g. PROJ)"><input className="plane-input w-full" placeholder="PROJ" maxLength={6} value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value.toUpperCase() }))} required style={{ textTransform: 'uppercase' }} /></Field>
        <Field label="Description"><textarea className="plane-input w-full resize-none h-20" placeholder="What is this project about?" value={form.description} onChange={set('description')} /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="plane-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading} className="plane-btn-primary">{loading ? 'Creating…' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const canCreate = CAN_CREATE_ROLES.org.includes(user?.orgRole) || CAN_CREATE_ROLES.global.includes(user?.role)

  useEffect(() => {
    if (!user?.orgId) { setLoading(false); return }
    CORE.get('/projects').then(r => setProjects(r.data)).catch(() => toast('Failed to load projects', 'error')).finally(() => setLoading(false))
  }, [user?.orgId])

  const archive = async (e, id) => {
    e.stopPropagation()
    try {
      const { data } = await CORE.patch(`/projects/${id}/archive`)
      setProjects(p => p.map(x => x.id === id ? data : x))
      toast('Project archived')
    } catch { toast('Failed to archive', 'error') }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Projects</h1>
          {user?.orgName && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">in {user.orgName}</p>}
        </div>
        {canCreate && (
          <button className="plane-btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="plane-card p-8 text-center space-y-2">
          <p className="text-sm text-[var(--text-secondary)]">No projects here yet.</p>
          {canCreate ? (
            <p className="text-xs text-[var(--text-tertiary)]">Create the first one to get your team moving.</p>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">Ask a workspace owner or admin to create one.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} onClick={() => navigate(`/app/projects/${p.id}/board`)}
              className="plane-card p-5 cursor-pointer hover:border-[var(--accent-primary)] transition-colors group">

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">{p.key}</span>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-1">{p.name}</h3>
                  {p.description && <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">{p.description}</p>}
                </div>
                {p.archived && <span className="text-[10px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded font-bold">ARCHIVED</span>}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] text-[var(--text-tertiary)]">{new Date(p.createdAt).toLocaleDateString()}</span>
                {!p.archived && canCreate && (
                  <button onClick={e => archive(e, p.id)}
                    className="text-[10px] text-[var(--text-tertiary)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateModal orgId={user?.orgId} onClose={() => setShowCreate(false)} onCreated={p => setProjects(prev => [...prev, p])} />}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <span className="font-semibold text-[var(--text-primary)]">{title}</span>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{label}</label>
      {children}
    </div>
  )
}
