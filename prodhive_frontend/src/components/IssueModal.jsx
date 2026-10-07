import { useState, useEffect, useRef } from 'react'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Badge, statusBadge, priorityBadge, typeBadge, prBadge, reviewBadge, STATUS_LABEL, Spinner } from './ui'
import ReviewPanel from './ReviewPanel'
import { fetchUsers, initialsOf } from '../services/userDirectory'

const STATUSES = ['BACKLOG','TODO','IN_PROGRESS','IN_REVIEW','DONE','REOPENED']
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL']
const TYPES = ['TASK','BUG','STORY','EPIC']
const LINK_TYPES = ['BLOCKS','RELATES_TO','DUPLICATES']

export default function IssueModal({ issueId, onClose, onUpdated }) {
  const toast = useToast()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('details')

  useEffect(() => {
    CORE.get(`/issues/${issueId}`)
        .then(r => setIssue(r.data))
        .catch(() => toast('Failed to load issue', 'error'))
        .finally(() => setLoading(false))
  }, [issueId])

  const patch = async (endpoint, body) => {
    try {
      const { data } = await CORE.patch(`/issues/${issueId}/${endpoint}`, body)
      setIssue(data); onUpdated?.(data)
    } catch { toast('Update failed', 'error') }
  }

  const TABS = ['details','subtasks','links','attachments','comments','pull-requests','history','ai']

  if (loading) return (
      <Overlay onClose={onClose}>
        <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
      </Overlay>
  )
  if (!issue) return null

  return (
      <Overlay onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Badge cls={typeBadge(issue.type)}>{issue.type}</Badge>
            <span className="text-xs text-[var(--text-tertiary)] font-mono">{issue.issueKey}</span>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">✕</button>
        </div>

        <div className="px-5 pt-4 pb-2">
          <h2 className="text-base font-bold text-[var(--text-primary)]">{issue.title}</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[var(--border-subtle)] px-5 overflow-x-auto">
          {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                      className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>
                {t === 'pull-requests' ? 'Pull Requests' : t === 'ai' ? '✨ AI Insights' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
          ))}
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'details'       && <DetailsTab issue={issue} patch={patch} />}
          {tab === 'subtasks'      && <SubtasksTab issueId={issueId} boardId={issue.board?.id} />}
          {tab === 'links'         && <LinksTab issueId={issueId} />}
          {tab === 'attachments'   && <AttachmentsTab issueId={issueId} />}
          {tab === 'comments'      && <CommentsTab issueId={issueId} />}
          {tab === 'pull-requests' && <IssuePRsTab issueId={issueId} />}
          {tab === 'history'       && <HistoryTab issueId={issueId} />}
          {tab === 'ai'            && <AIAnalysisTab issueId={issueId} />}
        </div>
      </Overlay>
  )
}

function Overlay({ onClose, children }) {
  return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
          {children}
        </div>
      </div>
  )
}

function DetailsTab({ issue, patch }) {
  const [reporterName, setReporterName] = useState(null)

  useEffect(() => {
    if (!issue.reporterId) return
    fetchUsers([issue.reporterId]).then(map => setReporterName(map.get(issue.reporterId)?.fullName))
  }, [issue.reporterId])

  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {issue.description || <span className="text-[var(--text-tertiary)] italic">No description</span>}
          </p>
          {issue.labels?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {issue.labels.map(l => (
                    <span key={l.id} className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: l.color + '33', color: l.color }}>{l.name}</span>
                ))}
              </div>
          )}
        </div>
        <div className="space-y-3">
          {[
            { label: 'Status', content: (
                  <select className="plane-input text-xs py-1" value={issue.status} onChange={e => patch('status', { status: e.target.value })}>
                    {['BACKLOG','TODO','IN_PROGRESS','IN_REVIEW','DONE','REOPENED'].map(s => <option key={s}>{s}</option>)}
                  </select>
              )},
            { label: 'Priority', content: <Badge cls={priorityBadge(issue.priority)}>{issue.priority}</Badge> },
            { label: 'Type',     content: <Badge cls={typeBadge(issue.type)}>{issue.type}</Badge> },
            { label: 'Assignee', content: <AssigneePicker issue={issue} patch={patch} /> },
            { label: 'Reporter', content: <span className="text-xs text-[var(--text-secondary)]">{reporterName || `User #${issue.reporterId}`}</span> },
            { label: 'Created',  content: <span className="text-xs text-[var(--text-secondary)]">{new Date(issue.createdAt).toLocaleDateString()}</span> },
          ].map(({ label, content }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</span>
                {content}
              </div>
          ))}
        </div>
      </div>
  )
}

function AssigneePicker({ issue, patch }) {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [names, setNames] = useState(new Map())
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const projectId = issue.board?.project?.id

  useEffect(() => {
    const onClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const openMenu = () => {
    setOpen(o => !o)
    if (!projectId || members.length > 0) return
    setLoading(true)
    CORE.get(`/projects/${projectId}/members`)
        .then(async r => { setMembers(r.data); setNames(await fetchUsers(r.data.map(m => m.userId))) })
        .catch(() => {})
        .finally(() => setLoading(false))
  }

  const assign = id => { patch('assignee', { assigneeId: id }); setOpen(false) }

  const currentInfo = names.get(issue.assigneeId)
  const label = issue.assigneeId ? (currentInfo?.fullName || `User #${issue.assigneeId}`) : 'Unassigned'

  return (
      <div className="relative" ref={ref}>
        <button onClick={openMenu} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">
          {issue.assigneeId && (
              <span className="w-4 h-4 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[8px] font-bold">{initialsOf(currentInfo?.fullName)}</span>
          )}
          {label}
        </button>
        {open && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-30 py-1 max-h-56 overflow-y-auto">
              {loading ? (
                  <p className="px-3 py-2 text-xs text-[var(--text-tertiary)]">Loading…</p>
              ) : (
                  <>
                    <button onClick={() => assign(null)} className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)] transition-colors">Unassigned</button>
                    {members.length === 0 ? (
                        <p className="px-3 py-2 text-[10px] text-[var(--text-tertiary)]">No project members yet — add some in Settings.</p>
                    ) : members.map(m => {
                      const info = names.get(m.userId)
                      return (
                          <button key={m.userId} onClick={() => assign(m.userId)}
                                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-[var(--bg-surface-2)] transition-colors ${m.userId === issue.assigneeId ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-primary)]'}`}>
                            <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{initialsOf(info?.fullName)}</span>
                            <span className="truncate">{info?.fullName || `User #${m.userId}`}</span>
                          </button>
                      )
                    })}
                  </>
              )}
            </div>
        )}
      </div>
  )
}

function SubtasksTab({ issueId, boardId }) {
  const toast = useToast()
  const [subtasks, setSubtasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')

  useEffect(() => {
    CORE.get(`/issues/${issueId}/subtasks`).then(r => setSubtasks(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [issueId])

  const create = async e => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const { data } = await CORE.post(`/issues/${issueId}/subtasks`, { title, type: 'TASK', priority: 'MEDIUM', boardId })
      setSubtasks(s => [...s, data]); setTitle(''); toast('Subtask created')
    } catch { toast('Failed', 'error') }
  }

  if (loading) return <Spinner />
  return (
      <div className="space-y-3">
        {subtasks.length === 0 ? <p className="text-xs text-[var(--text-tertiary)]">No subtasks yet.</p> : subtasks.map(s => (
            <div key={s.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-subtle)]">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.status === 'DONE' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{s.issueKey}</span>
              <span className="text-xs text-[var(--text-primary)] flex-1">{s.title}</span>
              <Badge cls={statusBadge(s.status)}>{STATUS_LABEL(s.status)}</Badge>
            </div>
        ))}
        <form onSubmit={create} className="flex gap-2 pt-2">
          <input className="plane-input flex-1 text-xs" placeholder="New subtask title…" value={title} onChange={e => setTitle(e.target.value)} />
          <button type="submit" className="plane-btn-primary text-xs">Add</button>
        </form>
      </div>
  )
}

function LinksTab({ issueId }) {
  const toast = useToast()
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ targetIssueId: '', linkType: 'BLOCKS' })

  useEffect(() => {
    CORE.get(`/issues/${issueId}/links`).then(r => setLinks(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [issueId])

  const create = async e => {
    e.preventDefault()
    try {
      const { data } = await CORE.post(`/issues/${issueId}/links`, { targetIssueId: Number(form.targetIssueId), linkType: form.linkType })
      setLinks(l => [...l, data]); setForm({ targetIssueId: '', linkType: 'BLOCKS' }); toast('Link created')
    } catch { toast('Failed', 'error') }
  }

  if (loading) return <Spinner />
  return (
      <div className="space-y-3">
        {links.length === 0 ? <p className="text-xs text-[var(--text-tertiary)]">No links yet.</p> : links.map(l => (
            <div key={l.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-subtle)]">
              <Badge cls="bg-slate-500/20 text-slate-300">{l.linkType?.replace('_', ' ')}</Badge>
              <span className="text-xs text-[var(--text-primary)]">{l.targetIssue?.issueKey} — {l.targetIssue?.title}</span>
            </div>
        ))}
        <form onSubmit={create} className="flex gap-2 pt-2 flex-wrap">
          <input className="plane-input text-xs w-28" type="number" placeholder="Target Issue ID" value={form.targetIssueId} onChange={e => setForm(f => ({ ...f, targetIssueId: e.target.value }))} required />
          <select className="plane-input text-xs" value={form.linkType} onChange={e => setForm(f => ({ ...f, linkType: e.target.value }))}>
            {LINK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button type="submit" className="plane-btn-primary text-xs">Link</button>
        </form>
      </div>
  )
}

function AttachmentsTab({ issueId }) {
  const toast = useToast()
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    CORE.get(`/issues/${issueId}/attachments`).then(r => setAttachments(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [issueId])

  const upload = async e => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const { data } = await CORE.post(`/issues/${issueId}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setAttachments(a => [...a, data]); toast('File uploaded')
    } catch { toast('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  if (loading) return <Spinner />
  return (
      <div className="space-y-3">
        {attachments.length === 0 ? <p className="text-xs text-[var(--text-tertiary)]">No attachments yet.</p> : attachments.map(a => (
            <div key={a.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-subtle)]">
              <span className="text-sm">📎</span>
              <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent-primary)] hover:underline flex-1 truncate">{a.fileName}</a>
              <span className="text-[10px] text-[var(--text-tertiary)]">{new Date(a.uploadedAt).toLocaleDateString()}</span>
            </div>
        ))}
        <div className="pt-2">
          <input ref={fileRef} type="file" className="hidden" onChange={upload} />
          <button onClick={() => fileRef.current.click()} disabled={uploading} className="plane-btn-secondary text-xs">
            {uploading ? 'Uploading…' : '+ Upload File'}
          </button>
        </div>
      </div>
  )
}

function CommentsTab({ issueId }) {
  const toast = useToast()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')

  useEffect(() => {
    CORE.get(`/issues/${issueId}/comments`).then(r => setComments(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [issueId])

  const post = async e => {
    e.preventDefault(); if (!text.trim()) return
    try {
      const { data } = await CORE.post(`/issues/${issueId}/comments`, { content: text })
      setComments(c => [...c, data]); setText('')
    } catch { toast('Failed to post comment', 'error') }
  }

  if (loading) return <Spinner />
  return (
      <div className="space-y-3">
        {comments.length === 0 ? <p className="text-xs text-[var(--text-tertiary)]">No comments yet.</p> : comments.map(c => (
            <div key={c.id} className="py-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[9px] font-bold">U</div>
                <span className="text-[10px] text-[var(--text-tertiary)]">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-[var(--text-primary)] pl-7 leading-relaxed">{c.content}</p>
            </div>
        ))}
        <form onSubmit={post} className="flex gap-2 pt-2">
          <textarea className="plane-input flex-1 text-xs resize-none h-16" placeholder="Add a comment…" value={text} onChange={e => setText(e.target.value)} />
          <button type="submit" className="plane-btn-primary text-xs self-end">Post</button>
        </form>
      </div>
  )
}

function IssuePRsTab({ issueId }) {
  const [prs, setPrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    CORE.get(`/issues/${issueId}/pull-requests`).then(r => setPrs(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [issueId])

  if (loading) return <Spinner />
  if (prs.length === 0) return (
      <div className="space-y-2">
        <p className="text-xs text-[var(--text-tertiary)]">No pull requests linked to this issue.</p>
        <p className="text-[10px] text-[var(--text-tertiary)]">Include the issue key in your PR title (e.g. <code className="bg-[var(--bg-surface-2)] px-1 rounded">PROJ-42 fix bug</code>) and it will be linked automatically via GitHub webhook.</p>
      </div>
  )

  return (
      <div className="space-y-2">
        {prs.map(pr => (
            <div key={pr.id} className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors"
                   onClick={() => setExpandedId(v => v === pr.id ? null : pr.id)}>
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono">#{pr.ghNumber}</span>
                <span className="text-xs text-[var(--text-primary)] flex-1 truncate font-medium">{pr.title}</span>
                <Badge cls={prBadge(pr.status)}>{pr.status}</Badge>
                <span className="text-[var(--text-tertiary)] text-xs">{expandedId === pr.id ? '▲' : '▼'}</span>
              </div>
              {expandedId === pr.id && (
                  <div className="border-t border-[var(--border-subtle)] p-3 bg-[var(--bg-canvas)]">
                    <ReviewPanel prId={pr.id} />
                  </div>
              )}
            </div>
        ))}
      </div>
  )
}

function HistoryTab({ issueId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    CORE.get(`/issues/${issueId}/history`).then(r => setHistory(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [issueId])

  if (loading) return <Spinner />
  if (history.length === 0) return <p className="text-xs text-[var(--text-tertiary)]">No history yet.</p>

  return (
      <div className="space-y-2">
        {history.map((h, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
              <span className="text-[10px] text-[var(--text-tertiary)] w-36 flex-shrink-0">{new Date(h.changedAt).toLocaleString()}</span>
              <Badge cls={statusBadge(h.fromStatus)}>{STATUS_LABEL(h.fromStatus)}</Badge>
              <span className="text-[var(--text-tertiary)] text-xs">→</span>
            </div>
        ))}
      </div>
  )
}

function AIAnalysisTab({ issueId }) {
  const toast = useToast()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await CORE.get(`/ai/issues/${issueId}/analyze`)
      setAnalysis(data.analysis)
    } catch (err) {
      const message = err.response?.data?.message || 'AI analysis failed — try again in a moment.'
      setError(message)
      toast(message, 'error')
    } finally { setLoading(false) }
  }

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--text-tertiary)]">Thinking it through…</p>
        </div>
    )
  }

  if (!analysis) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)]">✨ AI Issue Analysis</p>
          <p className="text-xs text-[var(--text-tertiary)] max-w-xs">
            Get a quick AI-generated summary, priority suggestion, risk factors, and a recommended next step for this issue.
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button onClick={analyze} className="plane-btn-primary text-xs mt-1">✨ Analyze with AI</button>
        </div>
    )
  }

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--text-primary)]">✨ AI Issue Analysis</p>
          <button onClick={analyze} className="plane-btn-secondary text-[10px]">Re-analyze</button>
        </div>
        <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap bg-[var(--bg-surface-2)] rounded-lg p-4">
          {analysis}
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)]">AI-generated — use your own judgment before acting on it.</p>
      </div>
  )
}
