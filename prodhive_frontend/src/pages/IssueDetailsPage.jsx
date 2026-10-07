import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Badge, statusBadge, priorityBadge, typeBadge, prBadge, STATUS_LABEL, Spinner } from '../components/ui'
import { fetchUsers, initialsOf } from '../services/userDirectory'
import ReviewPanel from '../components/ReviewPanel'

const LIFECYCLE = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const ALL_STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'REOPENED']

const activityMeta = {
  CREATED: { icon: '＋', tone: 'text-blue-400', label: 'created this task' },
  ASSIGNED: { icon: '↗', tone: 'text-cyan-400', label: 'updated the assignee' },
  STATUS_CHANGED: { icon: '→', tone: 'text-purple-400', label: 'changed the status' },
  COMMENTED: { icon: '◌', tone: 'text-slate-400', label: 'commented' },
  PR_OPENED: { icon: '⑂', tone: 'text-blue-400', label: 'opened a pull request' },
  PR_UPDATED: { icon: '↻', tone: 'text-cyan-400', label: 'updated the pull request' },
  REVIEW_SUBMITTED: { icon: '◍', tone: 'text-amber-400', label: 'submitted a review' },
  REVIEW_APPROVED: { icon: '✓', tone: 'text-emerald-400', label: 'approved the changes' },
  CHANGES_REQUESTED: { icon: '!', tone: 'text-red-400', label: 'requested changes' },
}

function relativeTime(value) {
  if (!value) return ''
  const diff = Date.now() - new Date(value).getTime()
  const minute = Math.floor(diff / 60000)
  if (minute < 1) return 'just now'
  if (minute < 60) return `${minute}m ago`
  const hour = Math.floor(minute / 60)
  if (hour < 24) return `${hour}h ago`
  const day = Math.floor(hour / 24)
  if (day < 7) return `${day}d ago`
  return new Date(value).toLocaleDateString()
}

export default function IssueDetailsPage() {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [issue, setIssue] = useState(null)
  const [activity, setActivity] = useState([])
  const [history, setHistory] = useState([])
  const [comments, setComments] = useState([])
  const [prs, setPrs] = useState([])
  const [users, setUsers] = useState(new Map())
  const [tab, setTab] = useState('overview')
  const [expandedPrId, setExpandedPrId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commenting, setCommenting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [issueRes, activityRes, historyRes, commentsRes, prsRes] = await Promise.all([
        CORE.get(`/issues/${issueId}`),
        CORE.get(`/issues/${issueId}/activity`),
        CORE.get(`/issues/${issueId}/history`),
        CORE.get(`/issues/${issueId}/comments`),
        CORE.get(`/issues/${issueId}/pull-requests`),
      ])
      setIssue(issueRes.data)
      setActivity(activityRes.data)
      setHistory(historyRes.data)
      setComments(commentsRes.data)
      setPrs(prsRes.data)

      const ids = [issueRes.data.assigneeId, issueRes.data.reporterId, ...activityRes.data.map(a => a.actorId)]
      setUsers(await fetchUsers(ids))
    } catch {
      toast('Failed to load task', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [issueId])

  const updateStatus = async status => {
    try {
      const { data } = await CORE.patch(`/issues/${issueId}/status`, { status })
      setIssue(data)
      const [a, h] = await Promise.all([
        CORE.get(`/issues/${issueId}/activity`),
        CORE.get(`/issues/${issueId}/history`),
      ])
      setActivity(a.data); setHistory(h.data)
      toast('Status updated')
    } catch (e) {
      toast(e.response?.data?.message || 'Unable to update status', 'error')
    }
  }

  const addComment = async e => {
    e.preventDefault()
    if (!newComment.trim()) return
    setCommenting(true)
    try {
      const { data } = await CORE.post(`/issues/${issueId}/comments`, { content: newComment.trim() })
      setComments(c => [...c, data])
      setNewComment('')
      const { data: next } = await CORE.get(`/issues/${issueId}/activity`)
      setActivity(next)
    } catch {
      toast('Failed to add comment', 'error')
    } finally { setCommenting(false) }
  }

  const currentStep = issue?.status === 'BACKLOG' ? 0 : Math.max(0, LIFECYCLE.indexOf(issue?.status))
  const lastActivity = useMemo(() => [...activity].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8), [activity])

  if (loading) return <Spinner />
  if (!issue) return null

  const assignee = users.get(issue.assigneeId)
  const reporter = users.get(issue.reporterId)

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-8">
      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
        <button onClick={() => navigate(-1)} className="hover:text-[var(--text-primary)] transition-colors">← Back</button>
        <span>/</span>
        <span>{issue.board?.project?.name || 'Project'}</span>
        <span>/</span>
        <span className="font-mono">{issue.issueKey}</span>
      </div>

      <header className="plane-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge cls={typeBadge(issue.type)}>{issue.type}</Badge>
              <span className="text-xs text-[var(--text-tertiary)] font-mono">{issue.issueKey}</span>
              <Badge cls={priorityBadge(issue.priority)}>{issue.priority}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{issue.title}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl whitespace-pre-wrap">
              {issue.description || 'No description has been added to this task yet.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select value={issue.status} onChange={e => updateStatus(e.target.value)} className="plane-input text-xs py-2">
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">Lifecycle</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Track the work from development to completion.</p>
            </div>
            <Badge cls={statusBadge(issue.status)}>{STATUS_LABEL(issue.status)}</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {LIFECYCLE.map((step, index) => {
              const done = issue.status === 'DONE' ? true : index < currentStep
              const active = step === issue.status
              return (
                <button key={step} onClick={() => updateStatus(step)} className={`text-left rounded-lg border p-3 transition-colors ${active ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--border-subtle)] bg-[var(--bg-surface-2)] hover:border-[var(--border-strong)]'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done || active ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-surface-1)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]'}`}>{done ? '✓' : index + 1}</span>
                    <span className={`text-xs font-semibold ${active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>{STATUS_LABEL(step)}</span>
                  </div>
                </button>
              )
            })}
          </div>
          {issue.status === 'REOPENED' && <p className="mt-2 text-xs text-red-300">This task was reopened and needs attention before it can return to the normal lifecycle.</p>}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <main className="lg:col-span-2 space-y-5">
          <section className="plane-card overflow-hidden">
            <div className="flex items-center gap-1 px-4 pt-2 border-b border-[var(--border-subtle)] overflow-x-auto">
              {['overview', 'activity', 'comments', 'history'].map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-3 text-xs font-semibold border-b-2 whitespace-nowrap ${tab === t ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>
                  {t === 'activity' ? `Activity${activity.length ? ` · ${activity.length}` : ''}` : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === 'overview' && <OverviewTab prs={prs} activity={lastActivity} onViewActivity={() => setTab('activity')} users={users} expandedPrId={expandedPrId} onTogglePr={id => setExpandedPrId(v => v === id ? null : id)} />}
              {tab === 'activity' && <ActivityTimeline activity={activity} users={users} />}
              {tab === 'history' && <HistoryTab history={history} users={users} />}
              {tab === 'comments' && (
                <div className="space-y-4">
                  {comments.length === 0 ? <p className="text-sm text-[var(--text-tertiary)]">No comments yet. Start the conversation.</p> : comments.map(c => (
                    <div key={c.id} className="flex gap-3 border-b border-[var(--border-subtle)] pb-4">
                      <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{initialsOf(users.get(c.authorId)?.fullName)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><span className="text-xs font-semibold text-[var(--text-primary)]">{users.get(c.authorId)?.fullName || `User #${c.authorId}`}</span><span className="text-[10px] text-[var(--text-tertiary)]">{relativeTime(c.createdAt)}</span></div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">{c.body || c.content}</p>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={addComment} className="flex gap-2 pt-2">
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="plane-input flex-1 min-h-20 resize-y text-xs" placeholder="Add context, ask a question, or leave an update…" />
                    <button disabled={commenting || !newComment.trim()} className="plane-btn-primary text-xs self-end">{commenting ? 'Posting…' : 'Comment'}</button>
                  </form>
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="plane-card p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)] mb-4">People</p>
            <PersonRow label="Assignee" user={assignee} fallback={issue.assigneeId ? `User #${issue.assigneeId}` : 'Unassigned'} />
            <PersonRow label="Reporter" user={reporter} fallback={`User #${issue.reporterId}`} />
          </section>

          <section className="plane-card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">Development</p>
              <span className="text-[10px] text-[var(--text-tertiary)]">{prs.length} PR{prs.length === 1 ? '' : 's'}</span>
            </div>
            {prs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border-subtle)] p-4 text-center">
                <p className="text-xs text-[var(--text-secondary)]">No pull request linked yet.</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Linking will happen automatically when a PR references {issue.issueKey}.</p>
              </div>
            ) : prs.map(pr => <PRCard key={pr.id} pr={pr} expanded={expandedPrId === pr.id} onToggle={() => setExpandedPrId(v => v === pr.id ? null : pr.id)} />)}
          </section>

          <section className="plane-card p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)] mb-3">Task metadata</p>
            <MetaRow label="Created" value={new Date(issue.createdAt).toLocaleDateString()} />
            <MetaRow label="Updated" value={relativeTime(issue.updatedAt)} />
            <MetaRow label="Type" value={issue.type} />
            <MetaRow label="Priority" value={issue.priority} />
            {issue.sprint?.name && <MetaRow label="Sprint" value={issue.sprint.name} />}
          </section>
        </aside>
      </div>
    </div>
  )
}

function PersonRow({ label, user, fallback }) {
  return <div className="flex items-center gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0">
    <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[10px] font-bold">{initialsOf(user?.fullName || fallback)}</div>
    <div className="min-w-0"><p className="text-[10px] text-[var(--text-tertiary)]">{label}</p><p className="text-xs font-medium text-[var(--text-primary)] truncate">{user?.fullName || fallback}</p></div>
  </div>
}

function MetaRow({ label, value }) {
  return <div className="flex justify-between gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0"><span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">{label}</span><span className="text-xs text-[var(--text-secondary)] text-right">{value}</span></div>
}

function OverviewTab({ prs, activity, onViewActivity, users, expandedPrId, onTogglePr }) {
  return <div className="space-y-6">
    <div>
      <div className="flex items-center justify-between mb-3"><h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent activity</h2><button onClick={onViewActivity} className="text-[10px] text-[var(--accent-primary)]">View all →</button></div>
      <ActivityTimeline activity={activity} users={users} compact />
    </div>
    <div>
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Pull requests</h2>
      {prs.length ? prs.map(pr => <PRCard key={pr.id} pr={pr} expanded={expandedPrId === pr.id} onToggle={() => onTogglePr(pr.id)} />) : <p className="text-xs text-[var(--text-tertiary)]">No development activity is linked to this task yet.</p>}
    </div>
  </div>
}

function ActivityTimeline({ activity, users, compact = false }) {
  if (!activity.length) return <div className="py-10 text-center text-xs text-[var(--text-tertiary)]">No activity recorded yet.</div>
  const items = compact ? activity.slice(-6) : activity
  return <div className="space-y-0">
    {items.map((a, index) => {
      const meta = activityMeta[a.action] || { icon: '•', tone: 'text-slate-400', label: a.action?.toLowerCase().replaceAll('_', ' ') }
      const actor = users.get(a.actorId)
      return <div key={a.id} className="flex gap-3 py-3">
        <div className="flex flex-col items-center"><div className={`w-7 h-7 rounded-full bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-bold ${meta.tone}`}>{meta.icon}</div>{index < items.length - 1 && <div className="w-px flex-1 bg-[var(--border-subtle)] mt-1" />}</div>
        <div className="min-w-0 flex-1 pb-1">
          <div className="flex items-baseline gap-2 flex-wrap"><span className="text-xs font-semibold text-[var(--text-primary)]">{actor?.fullName || (a.actorId ? `User #${a.actorId}` : 'GitHub')}</span><span className="text-xs text-[var(--text-secondary)]">{meta.label}</span><span className="text-[10px] text-[var(--text-tertiary)] ml-auto">{relativeTime(a.createdAt)}</span></div>
          {a.detail && <p className="text-xs text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">{a.detail}</p>}
        </div>
      </div>
    })}
  </div>
}

function HistoryTab({ history, users }) {
  if (!history.length) return <div className="py-10 text-center text-xs text-[var(--text-tertiary)]">No status transitions yet.</div>
  return <div className="space-y-2">{history.map(h => <div key={h.id} className="flex items-center gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0"><div className="w-7 h-7 rounded-full bg-[var(--bg-surface-2)] flex items-center justify-center text-xs text-[var(--accent-primary)]">→</div><div className="flex-1"><div className="flex items-center gap-2"><Badge cls={statusBadge(h.fromStatus)}>{STATUS_LABEL(h.fromStatus)}</Badge><span className="text-[var(--text-tertiary)]">→</span><Badge cls={statusBadge(h.toStatus)}>{STATUS_LABEL(h.toStatus)}</Badge></div><p className="text-[10px] text-[var(--text-tertiary)] mt-1">{users.get(h.changedBy)?.fullName || `User #${h.changedBy}`} · {new Date(h.changedAt).toLocaleString()}</p></div></div>)}</div>
}

function PRCard({ pr, expanded, onToggle }) {
  return <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden mb-2 last:mb-0 hover:border-[var(--border-strong)] transition-colors">
    <button type="button" onClick={onToggle} className="w-full text-left p-3">
      <div className="flex items-start gap-2"><span className="text-sm text-[var(--accent-primary)]">⑂</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[10px] font-mono text-[var(--text-tertiary)]">#{pr.ghNumber}</span><Badge cls={prBadge(pr.status)}>{pr.status}</Badge><span className="text-[10px] text-[var(--text-tertiary)] ml-auto">{expanded ? '▲' : '▼'}</span></div><p className="text-xs font-medium text-[var(--text-primary)] mt-1">{pr.title}</p></div></div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--text-tertiary)]"><span>{pr.authorUsername ? `@${pr.authorUsername}` : 'GitHub'} · {pr.branchName || 'branch unavailable'}</span><span>{pr.repoFullName || 'GitHub PR'}</span></div>
    </button>
    {expanded && <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        {pr.prUrl && <a href={pr.prUrl} target="_blank" rel="noreferrer" className="plane-btn-secondary text-[10px]">Open on GitHub ↗</a>}
        {pr.baseBranch && <span className="text-[10px] text-[var(--text-tertiary)]">{pr.branchName || 'head'} → {pr.baseBranch}</span>}
        {pr.additions != null && <span className="text-[10px] text-emerald-400">+{pr.additions}</span>}
        {pr.deletions != null && <span className="text-[10px] text-red-400">-{pr.deletions}</span>}
        {pr.changedFiles != null && <span className="text-[10px] text-[var(--text-tertiary)]">{pr.changedFiles} files</span>}
      </div>
      {pr.body && <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap max-h-40 overflow-auto">{pr.body}</p>}
      <ReviewPanel prId={pr.id} />
    </div>}
  </div>
}
