import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CORE, AUTH } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, Badge, timeAgo } from '../components/ui'
import { fetchUsers, initialsOf } from '../services/userDirectory'

const TABS = ['General', 'Members', 'Labels', 'Workflow', 'GitHub', 'Saved Filters']

export default function ProjectSettingsPage() {
  const { projectId } = useParams()
  const toast = useToast()
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'General')
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    CORE.get(`/projects/${projectId}`)
      .then(r => setProject(r.data))
      .catch(() => toast('Failed to load project', 'error'))
      .finally(() => setLoading(false))
  }, [projectId, toast])

  if (loading) return <Spinner />
  if (!project) return null

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-xl font-bold text-[var(--text-primary)]">Project Settings</h1>

      <div className="flex gap-0 border-b border-[var(--border-subtle)]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'General'       && <GeneralTab project={project} setProject={setProject} projectId={projectId} />}
      {tab === 'Members'       && <MembersTab projectId={projectId} />}
      {tab === 'Labels'        && <LabelsTab projectId={projectId} />}
      {tab === 'Workflow'      && <WorkflowTab projectId={projectId} />}
      {tab === 'GitHub'        && <GitHubTab projectId={projectId} />}
      {tab === 'Saved Filters' && <SavedFiltersTab projectId={projectId} />}
    </div>
  )
}

function GeneralTab({ project, setProject, projectId }) {
  const toast = useToast()
  const [form, setForm] = useState({ name: project.name, description: project.description || '' })
  const [saving, setSaving] = useState(false)

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await CORE.patch(`/projects/${projectId}`, form)
      setProject(data); toast('Project updated')
    } catch { toast('Failed', 'error') }
    finally { setSaving(false) }
  }

  const archive = async () => {
    try {
      const { data } = await CORE.patch(`/projects/${projectId}/archive`)
      setProject(data); toast('Project archived')
    } catch { toast('Failed', 'error') }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="plane-card p-5 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Project Name</label>
          <input className="plane-input w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Description</label>
          <textarea className="plane-input w-full resize-none h-24" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-[var(--text-tertiary)]">Key: <strong className="text-[var(--text-primary)]">{project.key}</strong></span>
          {project.archived && <Badge cls="bg-slate-500/20 text-slate-300">ARCHIVED</Badge>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button type="button" onClick={archive} disabled={project.archived}
          className="text-xs text-red-400 hover:underline disabled:opacity-40">
          {project.archived ? 'Already archived' : 'Archive project'}
        </button>
        <button type="submit" disabled={saving} className="plane-btn-primary text-xs">{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>
    </form>
  )
}

function MembersTab({ projectId }) {
  const { user } = useAuth()
  const toast = useToast()
  const [members, setMembers] = useState([])
  const [names, setNames] = useState(new Map())
  const [orgMembers, setOrgMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ userId: '', role: 'MEMBER' })

  useEffect(() => {
    Promise.all([
      CORE.get(`/projects/${projectId}/members`),
      user?.orgId ? AUTH.get(`/organizations/${user.orgId}/members`) : Promise.resolve({ data: [] }),
    ]).then(async ([projMembers, orgMembersRes]) => {
      setMembers(projMembers.data)
      setOrgMembers(orgMembersRes.data)
      const ids = [
        ...projMembers.data.map(m => m.userId),
        ...orgMembersRes.data.map(m => m.userId ?? m.user?.id),
      ]
      setNames(await fetchUsers(ids))
    }).catch(() => toast('Failed to load members', 'error'))
      .finally(() => setLoading(false))
  }, [projectId, user?.orgId])

  // Only offer org members who aren't already on this project — avoids duplicate-add errors entirely.
  const addableOrgMembers = orgMembers.filter(om => {
    const id = om.userId ?? om.user?.id
    return !members.some(pm => pm.userId === id)
  })

  const add = async e => {
    e.preventDefault()
    if (!form.userId) return
    try {
      const { data } = await CORE.post(`/projects/${projectId}/members`, { userId: Number(form.userId), role: form.role })
      setMembers(m => [...m, data]); setForm({ userId: '', role: 'MEMBER' }); toast('Member added')
    } catch (err) { toast(err.response?.data?.message || 'Failed to add member', 'error') }
  }

  const remove = async userId => {
    try {
      await CORE.delete(`/projects/${projectId}/members/${userId}`)
      setMembers(m => m.filter(x => x.userId !== userId)); toast('Member removed')
    } catch { toast('Failed to remove member', 'error') }
  }

  if (loading) return <Spinner />
  return (
    <div className="space-y-4">
      <div className="plane-card overflow-hidden p-0">
        {members.length === 0
          ? <p className="p-4 text-xs text-[var(--text-tertiary)]">No members yet — add people from your organization below.</p>
          : members.map(m => {
            const info = names.get(m.userId)
            return (
              <div key={m.userId} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
                <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[10px] font-bold">{initialsOf(info?.fullName)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-primary)] truncate">{info?.fullName || `User #${m.userId}`}</p>
                  {info?.email && <p className="text-[10px] text-[var(--text-tertiary)] truncate">{info.email}</p>}
                </div>
                <Badge cls={m.role === 'PM' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-500/20 text-slate-300'}>{m.role}</Badge>
                <button onClick={() => remove(m.userId)} className="text-[var(--text-tertiary)] hover:text-red-400 text-xs">✕</button>
              </div>
            )
          })
        }
      </div>
      <form onSubmit={add} className="flex gap-2 items-end">
        <div className="space-y-1 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Add from organization</label>
          <select className="plane-input w-full text-xs" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required>
            <option value="" disabled>{addableOrgMembers.length === 0 ? 'Everyone in the org is already on this project' : 'Select a person…'}</option>
            {addableOrgMembers.map(om => {
              const id = om.userId ?? om.user?.id
              const info = names.get(id)
              return <option key={id} value={id}>{info?.fullName || `User #${id}`} ({info?.email})</option>
            })}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Role</label>
          <select className="plane-input text-xs" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="MEMBER">MEMBER</option>
            <option value="PM">PM</option>
          </select>
        </div>
        <button type="submit" disabled={addableOrgMembers.length === 0} className="plane-btn-primary text-xs">Add</button>
      </form>
      {orgMembers.length === 0 && (
        <p className="text-[10px] text-[var(--text-tertiary)]">No one else is in your organization yet — invite teammates from the Organization page first.</p>
      )}
    </div>
  )
}

function LabelsTab({ projectId }) {
  const toast = useToast()
  const [labels, setLabels] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', color: '#3f76ff' })

  useEffect(() => {
    CORE.get(`/projects/${projectId}/labels`).then(r => setLabels(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [projectId])

  const create = async e => {
    e.preventDefault()
    try {
      const { data } = await CORE.post(`/projects/${projectId}/labels`, form)
      setLabels(l => [...l, data]); setForm({ name: '', color: '#3f76ff' }); toast('Label created')
    } catch { toast('Failed', 'error') }
  }

  const del = async id => {
    try {
      await CORE.delete(`/projects/${projectId}/labels/${id}`)
      setLabels(l => l.filter(x => x.id !== id)); toast('Label deleted')
    } catch { toast('Failed', 'error') }
  }

  if (loading) return <Spinner />
  return (
    <div className="space-y-4">
      <div className="plane-card overflow-hidden p-0">
        {labels.length === 0
          ? <p className="p-4 text-xs text-[var(--text-tertiary)]">No labels yet.</p>
          : labels.map(l => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: l.color }} />
              <span className="text-xs text-[var(--text-primary)] flex-1">{l.name}</span>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{l.color}</span>
              <button onClick={() => del(l.id)} className="text-[var(--text-tertiary)] hover:text-red-400 text-xs">✕</button>
            </div>
          ))
        }
      </div>
      <form onSubmit={create} className="flex gap-2 items-end">
        <div className="space-y-1 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Label Name</label>
          <input className="plane-input w-full text-xs" placeholder="e.g. frontend" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Color</label>
          <input type="color" className="h-9 w-12 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] cursor-pointer" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
        </div>
        <button type="submit" className="plane-btn-primary text-xs">Create</button>
      </form>
    </div>
  )
}

function WorkflowTab({ projectId }) {
  const toast = useToast()
  const [map, setMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ fromStatus: 'TODO', toStatus: 'IN_PROGRESS' })
  const STATUSES = ['BACKLOG','TODO','IN_PROGRESS','IN_REVIEW','DONE','REOPENED']

  useEffect(() => {
    CORE.get(`/projects/${projectId}/workflow/map`).then(r => setMap(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [projectId])

  const add = async e => {
    e.preventDefault()
    try {
      await CORE.post(`/projects/${projectId}/workflow`, form)
      const r = await CORE.get(`/projects/${projectId}/workflow/map`)
      setMap(r.data); toast('Transition added')
    } catch { toast('Failed', 'error') }
  }

  const remove = async (from, to) => {
    try {
      await CORE.delete(`/projects/${projectId}/workflow`, { data: { fromStatus: from, toStatus: to } })
      const r = await CORE.get(`/projects/${projectId}/workflow/map`)
      setMap(r.data); toast('Transition removed')
    } catch { toast('Failed', 'error') }
  }

  if (loading) return <Spinner />
  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--text-tertiary)]">Define which status transitions are allowed for this project.</p>
      <div className="plane-card overflow-hidden p-0">
        {Object.entries(map).map(([from, tos]) => (
          <div key={from} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-xs font-mono text-[var(--text-secondary)] w-28 flex-shrink-0 pt-0.5">{from}</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {tos.length === 0
                ? <span className="text-[10px] text-[var(--text-tertiary)]">No transitions</span>
                : tos.map(to => (
                  <span key={to} className="flex items-center gap-1 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded px-2 py-0.5 text-[10px] text-[var(--text-primary)]">
                    → {to}
                    <button onClick={() => remove(from, to)} className="text-[var(--text-tertiary)] hover:text-red-400 ml-1">✕</button>
                  </span>
                ))
              }
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="flex gap-2 items-end flex-wrap">
        {[['fromStatus','From'],['toStatus','To']].map(([k,l]) => (
          <div key={k} className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{l}</label>
            <select className="plane-input text-xs" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
        <button type="submit" className="plane-btn-primary text-xs">Add Transition</button>
      </form>
    </div>
  )
}

function GitHubTab({ projectId }) {
  const toast = useToast()
  const { user } = useAuth()
  const [integration, setIntegration] = useState(null)
  const [installation, setInstallation] = useState(null)
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState('')
  const [myGithubUsername, setMyGithubUsername] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [savingUsername, setSavingUsername] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const installationId = new URLSearchParams(window.location.search).get('github_installation')

  const syncNow = async () => {
    setSyncing(true)
    try {
      await CORE.post(`/projects/${projectId}/github/sync`)
      const { data } = await CORE.get(`/projects/${projectId}/github`)
      setIntegration(data)
      toast('Synced with GitHub')
    } catch {
      toast('Sync failed', 'error')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    fetchUsers([user.id]).then(names => {
      const mine = names.get(user.id)?.githubUsername || ''
      setMyGithubUsername(mine)
      setUsernameInput(mine)
    })
  }, [user?.id])

  const saveUsername = async () => {
    setSavingUsername(true)
    try {
      await AUTH.patch('/users/me/github-username', { githubUsername: usernameInput.trim() })
      setMyGithubUsername(usernameInput.trim())
      toast('GitHub username saved')
    } catch {
      toast('Failed to save GitHub username', 'error')
    } finally {
      setSavingUsername(false)
    }
  }

  const load = async () => {
    try {
      const r = await CORE.get(`/projects/${projectId}/github`)
      setIntegration(r.data)
    } catch { setIntegration(null) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [projectId])

  useEffect(() => {
    if (!installationId) return
    const id = Number(installationId)
    if (!Number.isFinite(id)) return
    setConnecting(true)
    Promise.all([
      CORE.get(`/github/installations/${id}`),
      CORE.get(`/github/installations/${id}/repositories`)
    ]).then(([inst, repos]) => {
      setInstallation(inst.data)
      setRepositories(repos.data.repositories || [])
      setSelectedRepo(repos.data.repositories?.[0]?.full_name || '')
    }).catch(() => toast('Could not load GitHub repositories', 'error'))
      .finally(() => setConnecting(false))
  }, [installationId])

  const connectGitHub = async () => {
    try {
      const { data } = await CORE.get(`/projects/${projectId}/github/app/install-url`)
      window.location.href = data.url
    } catch (err) {
      toast(err?.response?.data?.message || 'GitHub App is not configured on this server. Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY in .env.', 'error')
    }
  }

  const connectRepository = async () => {
    if (!installationId || !selectedRepo) return
    setConnecting(true)
    try {
      const { data } = await CORE.post(`/projects/${projectId}/github/app/connect`, {
        installationId: Number(installationId),
        repoFullName: selectedRepo
      })
      setIntegration(data)
      window.history.replaceState({}, '', window.location.pathname + '?tab=GitHub')
      toast('GitHub repository connected')
    } catch (e) {
      toast(e?.response?.data?.message || 'Failed to connect repository', 'error')
    } finally { setConnecting(false) }
  }

  const disconnect = async () => {
    try {
      await CORE.delete(`/projects/${projectId}/github`)
      setIntegration(null)
      toast('GitHub disconnected')
    } catch { toast('Failed to disconnect', 'error') }
  }

  if (loading) return <Spinner />

  const GithubUsernameCard = (
    <div className="plane-card p-5 space-y-3">
      <div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">Your GitHub username</div>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">Link your GitHub account so teammates can request you as a reviewer on pull requests.</p>
      </div>
      <div className="flex items-center gap-2">
        <input className="plane-input flex-1 text-xs" placeholder="e.g. octocat"
          value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
        <button onClick={saveUsername} disabled={savingUsername || usernameInput.trim() === myGithubUsername}
          className="plane-btn-primary text-xs flex-shrink-0">
          {savingUsername ? 'Saving…' : 'Save'}
        </button>
      </div>
      {myGithubUsername && <p className="text-[11px] text-emerald-400">✓ Linked as @{myGithubUsername}</p>}
    </div>
  )

  if (integration) return (
    <div className="space-y-4">
      <div className="plane-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">GitHub connected</div>
              <div className="text-xs text-[var(--text-tertiary)]">{integration.accountLogin ? `Installed on @${integration.accountLogin}` : 'GitHub App installation active'}</div>
            </div>
          </div>
          <button onClick={disconnect} className="text-xs text-red-400 hover:underline">Disconnect</button>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Repository</div>
          <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">{integration.repoFullName}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-[var(--border-subtle)] p-3"><div className="text-[var(--text-tertiary)]">Pull requests</div><div className="mt-1 text-[var(--text-secondary)]">Automatic</div></div>
          <div className="rounded-lg border border-[var(--border-subtle)] p-3"><div className="text-[var(--text-tertiary)]">Reviews</div><div className="mt-1 text-[var(--text-secondary)]">Automatic</div></div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {integration.lastSyncedAt ? `Last synchronized ${timeAgo(integration.lastSyncedAt)}` : 'Not synced yet'}
          </span>
          <button onClick={syncNow} disabled={syncing} className="text-xs text-[var(--accent-primary)] hover:underline flex-shrink-0">
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)]">Webhooks are handled by the ProdHive GitHub App. You do not need to configure repository webhooks manually.</p>
      </div>
      {GithubUsernameCard}
    </div>
  )

  if (installationId) return (
    <div className="space-y-4">
      <div className="plane-card p-5 space-y-4">
        <div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">Choose a repository</div>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">GitHub App installed{installation?.accountLogin ? ` on @${installation.accountLogin}` : ''}. Select the repository this ProdHive project should track.</p>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Repository</label>
          <select className="plane-input w-full text-xs" value={selectedRepo} onChange={e => setSelectedRepo(e.target.value)} disabled={connecting}>
            {repositories.map(repo => <option key={repo.id} value={repo.full_name}>{repo.full_name}{repo.private ? ' · private' : ''}</option>)}
          </select>
        </div>
        <button onClick={connectRepository} disabled={connecting || !selectedRepo} className="plane-btn-primary text-xs">{connecting ? 'Connecting…' : 'Connect Repository'}</button>
      </div>
      {GithubUsernameCard}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="plane-card p-5 space-y-5">
        <div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">Connect GitHub</div>
          <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">Install the ProdHive GitHub App, choose the repositories it can access, and let ProdHive automatically synchronize pull requests, reviews, and development activity.</p>
        </div>
        <div className="p-3 bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-lg text-xs space-y-1">
          <p className="font-semibold text-[var(--text-primary)]">GitHub App Configuration Status</p>
          <p className="text-[var(--text-tertiary)]">To enable GitHub integration, set <code className="bg-black/10 px-1 py-0.5 rounded">GITHUB_APP_ID</code> and <code className="bg-black/10 px-1 py-0.5 rounded">GITHUB_APP_PRIVATE_KEY</code> in your root <code className="bg-black/10 px-1 py-0.5 rounded">.env</code> file.</p>
        </div>
        <div className="space-y-2 text-xs text-[var(--text-secondary)]">
          <div>✓ No personal access token to copy</div>
          <div>✓ No per-repository webhook configuration</div>
          <div>✓ Pull requests and reviews sync automatically</div>
        </div>
        <button onClick={connectGitHub} className="plane-btn-primary text-xs">Connect GitHub</button>
      </div>
      {GithubUsernameCard}
    </div>
  )

}

function SavedFiltersTab({ projectId }) {
  const toast = useToast()
  const [filters, setFilters] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', filterJson: '' })

  useEffect(() => {
    CORE.get(`/projects/${projectId}/saved-filters`).then(r => setFilters(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [projectId])

  const create = async e => {
    e.preventDefault()
    try {
      const { data } = await CORE.post(`/projects/${projectId}/saved-filters`, form)
      setFilters(f => [...f, data]); setForm({ name: '', filterJson: '' }); toast('Filter saved')
    } catch { toast('Failed', 'error') }
  }

  const del = async id => {
    try {
      await CORE.delete(`/projects/${projectId}/saved-filters/${id}`)
      setFilters(f => f.filter(x => x.id !== id)); toast('Filter deleted')
    } catch { toast('Failed', 'error') }
  }

  if (loading) return <Spinner />
  return (
    <div className="space-y-4">
      <div className="plane-card overflow-hidden p-0">
        {filters.length === 0
          ? <p className="p-4 text-xs text-[var(--text-tertiary)]">No saved filters yet.</p>
          : filters.map(f => (
            <div key={f.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
              <span className="text-xs font-medium text-[var(--text-primary)] flex-1">{f.name}</span>
              <code className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface-2)] px-2 py-0.5 rounded max-w-xs truncate">{f.filterJson}</code>
              <button onClick={() => del(f.id)} className="text-[var(--text-tertiary)] hover:text-red-400 text-xs">✕</button>
            </div>
          ))
        }
      </div>
      <form onSubmit={create} className="flex gap-2 items-end flex-wrap">
        <div className="space-y-1 flex-1 min-w-32">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Filter Name</label>
          <input className="plane-input w-full text-xs" placeholder="My Filter" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="space-y-1 flex-1 min-w-48">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Filter JSON</label>
          <input className="plane-input w-full text-xs font-mono" placeholder='{"priority":"HIGH"}' value={form.filterJson} onChange={e => setForm(f => ({ ...f, filterJson: e.target.value }))} required />
        </div>
        <button type="submit" className="plane-btn-primary text-xs">Save</button>
      </form>
    </div>
  )
}
