import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUTH } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, Empty, Badge } from '../components/ui'
import { fetchUsers, initialsOf } from '../services/userDirectory'

const ROLE_BADGE = {
  OWNER: 'bg-purple-500/20 text-purple-300',
  ADMIN: 'bg-blue-500/20 text-blue-300',
  MEMBER: 'bg-slate-500/20 text-slate-300',
}

export default function OrgPage() {
  const { applyOrgContext } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [manageOrg, setManageOrg] = useState(null) // org object, or null

  const load = useCallback(() => {
    setLoading(true)
    AUTH.get('/organizations/mine')
      .then(r => setOrgs(r.data))
      .catch(() => toast('Failed to load your workspaces', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const enterOrg = async org => {
    try {
      const { data } = await AUTH.post(`/organizations/${org.id}/switch`)
      applyOrgContext(data.token, data.organization.name)
      toast(`Switched to ${data.organization.name}`)
      navigate('/app/projects')

    } catch (err) {
      toast(err.response?.data?.message || 'Could not switch workspace', 'error')
    }
  }

  if (manageOrg) {
    return <ManageOrgView org={manageOrg} onBack={() => setManageOrg(null)} />
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Your Workspaces</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Pick one to work in, or create a new one.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowJoin(true)} className="plane-btn-secondary text-xs">Join with code</button>
          <button onClick={() => setShowCreate(true)} className="plane-btn-primary text-xs">+ New Organization</button>
        </div>
      </div>

      {loading ? <Spinner /> : orgs.length === 0 ? (
        <div className="plane-card p-8 text-center space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">You're not part of any workspace yet.</p>
          <p className="text-xs text-[var(--text-tertiary)]">Create one to get started, or ask a teammate for their invite link/code.</p>
          <div className="flex justify-center gap-2 pt-2">
            <button onClick={() => setShowJoin(true)} className="plane-btn-secondary text-xs">Join with code</button>
            <button onClick={() => setShowCreate(true)} className="plane-btn-primary text-xs">Create your first workspace</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orgs.map(org => (
            <div key={org.id} className="plane-card p-4 flex flex-col gap-3 hover:border-[var(--accent-primary)] transition-colors">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {org.name?.[0]?.toUpperCase() || 'O'}
                </div>
                <Badge cls={ROLE_BADGE[org.role] || ROLE_BADGE.MEMBER}>{org.role}</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{org.name}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{org.memberCount} member{org.memberCount === 1 ? '' : 's'} · {org.slug}</p>
              </div>
              <div className="flex gap-2 mt-auto pt-1">
                <button onClick={() => enterOrg(org)} className="plane-btn-primary text-xs flex-1">Open</button>
                {(org.role === 'OWNER' || org.role === 'ADMIN') && (
                  <button onClick={() => setManageOrg(org)} className="plane-btn-secondary text-xs">Manage</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateOrgModal
          onClose={() => setShowCreate(false)}
          onCreated={org => { load(); enterOrg(org) }}
        />
      )}
      {showJoin && (
        <JoinOrgModal
          onClose={() => setShowJoin(false)}
          onJoined={() => { load() }}
        />
      )}
    </div>
  )
}

function CreateOrgModal({ onClose, onCreated }) {
  const toast = useToast()
  const { applyOrgContext } = useAuth()
  const [form, setForm] = useState({ name: '', slug: '' })
  const [loading, setLoading] = useState(false)

  const slugify = v => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await AUTH.post('/organizations', form)
      applyOrgContext(data.token, data.organization.name)
      toast('Workspace created — you\'re in!')
      onCreated(data.organization)
      onClose()
    } catch (err) { toast(err.response?.data?.message || 'Failed to create workspace', 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="New Organization" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Organization Name</label>
          <input className="plane-input w-full" placeholder="Acme Corp" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug === slugify(f.name) ? slugify(e.target.value) : f.slug }))}
            required autoFocus />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Slug (auto-filled, editable)</label>
          <input className="plane-input w-full text-xs" placeholder="acme-corp" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} required />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="plane-btn-secondary text-xs" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading} className="plane-btn-primary text-xs">{loading ? 'Creating…' : 'Create & Enter'}</button>
        </div>
      </form>
    </Modal>
  )
}

function JoinOrgModal({ onClose, onJoined }) {
  const toast = useToast()
  const navigate = useNavigate()
  const { applyOrgContext } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await AUTH.post(`/organizations/join/${code.trim()}`)
      applyOrgContext(data.token, data.organization.name)
      toast(`Joined ${data.organization.name}!`)
      onJoined()
      onClose()
      navigate('/app/projects')

    } catch (err) { toast(err.response?.data?.message || 'Invalid or expired code', 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Join a Workspace" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Invite Code</label>
          <input className="plane-input w-full text-sm font-mono tracking-widest text-center" placeholder="XXXXXXXX"
            value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={8} required autoFocus />
          <p className="text-[10px] text-[var(--text-tertiary)]">Ask a workspace admin for their invite link or code.</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="plane-btn-secondary text-xs" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={loading || code.length < 4} className="plane-btn-primary text-xs">{loading ? 'Joining…' : 'Join'}</button>
        </div>
      </form>
    </Modal>
  )
}

function ManageOrgView({ org, onBack }) {
  const [tab, setTab] = useState('Members')
  const TABS = ['Members', 'Invite']

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm">← Back</button>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{org.name}</h1>
      </div>
      <div className="flex gap-0 border-b border-[var(--border-subtle)]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${tab === t ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Members' && <MembersTab orgId={org.id} />}
      {tab === 'Invite'  && <InviteTab orgId={org.id} />}
    </div>
  )
}

function MembersTab({ orgId }) {
  const toast = useToast()
  const [members, setMembers] = useState([])
  const [names, setNames] = useState(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    AUTH.get(`/organizations/${orgId}/members`)
      .then(async r => {
        setMembers(r.data)
        const map = await fetchUsers(r.data.map(m => m.userId ?? m.user?.id))
        setNames(map)
      })
      .catch(() => toast('Failed to load members', 'error'))
      .finally(() => setLoading(false))
  }, [orgId])

  if (loading) return <Spinner />
  return members.length === 0 ? <Empty text="No members." /> : (
    <div className="plane-card overflow-hidden p-0">
      {members.map(m => {
        const id = m.userId ?? m.user?.id
        const info = names.get(id)
        return (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
            <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {initialsOf(info?.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--text-primary)] truncate">{info?.fullName || `User #${id}`}</p>
              {info?.email && <p className="text-[10px] text-[var(--text-tertiary)] truncate">{info.email}</p>}
            </div>
            <Badge cls={ROLE_BADGE[m.role] || ROLE_BADGE.MEMBER}>{m.role}</Badge>
          </div>
        )
      })}
    </div>
  )
}

function InviteTab({ orgId }) {
  const toast = useToast()
  const [form, setForm] = useState({ email: '', role: 'MEMBER' })
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState([])
  const [joinCode, setJoinCode] = useState(null)
  const [codeLoading, setCodeLoading] = useState(true)

  useEffect(() => {
    AUTH.get(`/organizations/${orgId}/join-code`).then(r => setJoinCode(r.data.joinCode)).catch(() => {}).finally(() => setCodeLoading(false))
  }, [orgId])

  const inviteLink = joinCode ? `${window.location.origin}/join/${joinCode}` : ''

  const copy = async text => {
    try { await navigator.clipboard.writeText(text); toast('Copied to clipboard') }
    catch { toast('Could not copy — copy it manually', 'error') }
  }

  const regenerate = async () => {
    try {
      const { data } = await AUTH.post(`/organizations/${orgId}/join-code/regenerate`)
      setJoinCode(data.joinCode)
      toast('New invite link generated — the old one no longer works')
    } catch { toast('Failed to regenerate', 'error') }
  }

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await AUTH.post(`/organizations/${orgId}/invitations`, { email: form.email, role: form.role })
      setPending(p => [{ ...data }, ...p])
      setForm({ email: '', role: 'MEMBER' })
      toast(`Invite sent to ${data.email}`)
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {/* Shareable link — the easy path */}
      <div className="plane-card p-5 space-y-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Shareable Invite Link</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Anyone with this link can join instantly as a member — no email needed.</p>
        </div>
        {codeLoading ? <Spinner /> : (
          <>
            <div className="flex gap-2">
              <input readOnly value={inviteLink} className="plane-input flex-1 text-xs font-mono" onFocus={e => e.target.select()} />
              <button onClick={() => copy(inviteLink)} className="plane-btn-primary text-xs">Copy Link</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-tertiary)]">Code: <code className="bg-[var(--bg-surface-2)] px-1.5 py-0.5 rounded text-[var(--text-primary)]">{joinCode}</code></span>
              <button onClick={regenerate} className="text-[10px] text-red-400 hover:underline">Regenerate (revokes old link)</button>
            </div>
          </>
        )}
      </div>

      {/* Targeted email invite — for when you want a specific role */}
      <div className="plane-card p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Invite by Email</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Use this to grant ADMIN up front, or invite someone specific.</p>
        </div>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="space-y-1 flex-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Email</label>
            <input className="plane-input w-full text-xs" type="email" placeholder="colleague@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Role</label>
            <select className="plane-input text-xs" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="plane-btn-primary text-xs">{loading ? 'Sending…' : 'Send Invite'}</button>
        </form>
      </div>

      {pending.length > 0 && (
        <div className="plane-card overflow-hidden p-0">
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">Sent this session</p>
          {pending.map(inv => (
            <div key={inv.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
              <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{inv.email}</span>
              <Badge cls={ROLE_BADGE[inv.role] || ROLE_BADGE.MEMBER}>{inv.role}</Badge>
              <span className="text-[10px] text-emerald-400">Pending acceptance</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
