import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Badge, statusBadge, priorityBadge, typeBadge, Spinner, STATUS_LABEL } from '../components/ui'
import CreateIssueModal from '../components/CreateIssueModal'

export default function BacklogPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [board, setBoard] = useState(null)
  const [sprints, setSprints] = useState([])
  const [sprintIssues, setSprintIssues] = useState({})
  const [backlog, setBacklog] = useState([])
  const [collapsed, setCollapsed] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef()

  const load = async () => {
    const br = await CORE.get(`/boards?projectId=${projectId}`)
    if (!br.data.length) { setLoading(false); return }
    const b = br.data[0]; setBoard(b)
    const [sp, bl] = await Promise.all([
      CORE.get(`/sprints?boardId=${b.id}`),
      CORE.get(`/issues?boardId=${b.id}&backlogOnly=true`),
    ])
    setSprints(sp.data); setBacklog(bl.data)
    const map = {}
    await Promise.all(sp.data.map(async s => {
      const r = await CORE.get(`/issues?boardId=${b.id}&sprintId=${s.id}`)
      map[s.id] = r.data
    }))
    setSprintIssues(map)
  }

  useEffect(() => { load().catch(() => toast('Failed to load backlog', 'error')).finally(() => setLoading(false)) }, [projectId])

  const sprintAction = async (id, action) => {
    try {
      const { data } = await CORE.patch(`/sprints/${id}/${action}`)
      setSprints(s => s.map(x => x.id === id ? data : x))
      toast(`Sprint ${action === 'start' ? 'started' : 'completed'}`)
    } catch { toast('Action failed', 'error') }
  }

  const importCsv = async e => {
    const file = e.target.files[0]; if (!file || !board) return
    setImporting(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const { data } = await CORE.post(`/boards/${board.id}/import`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setBacklog(b => [...b, ...data]); toast(`Imported ${data.length} issues`)
    } catch { toast('Import failed', 'error') }
    finally { setImporting(false) }
  }

  if (loading) return <Spinner />
  if (!board) return <div className="flex items-center justify-center h-48 text-sm text-[var(--text-tertiary)]">No board found.</div>

  const IssueRow = ({ issue }) => (
    <div onClick={() => navigate(`/app/issues/${issue.id}`)}
      className="flex items-center gap-3 px-4 py-2.5 border-t border-[var(--border-subtle)] hover:bg-[var(--bg-surface-2)] cursor-pointer transition-colors">
      <Badge cls={typeBadge(issue.type)}>{issue.type}</Badge>
      <span className="text-[10px] text-[var(--text-tertiary)] font-mono w-20 flex-shrink-0">{issue.issueKey}</span>
      <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{issue.title}</span>
      <Badge cls={statusBadge(issue.status)}>{STATUS_LABEL(issue.status)}</Badge>
      <Badge cls={priorityBadge(issue.priority)}>{issue.priority}</Badge>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Backlog</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCsv} />
          <button onClick={() => fileRef.current.click()} disabled={importing} className="plane-btn-secondary text-xs">
            {importing ? 'Importing…' : '↑ Import CSV'}
          </button>
          <button className="plane-btn-primary text-xs" onClick={() => setShowCreate(true)}>+ Create Issue</button>
        </div>
      </div>

      {sprints.map(sprint => (
        <div key={sprint.id} className="plane-card overflow-hidden p-0">
          <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors"
            onClick={() => setCollapsed(c => ({ ...c, [sprint.id]: !c[sprint.id] }))}>
            <span className="text-[var(--text-tertiary)] text-xs">{collapsed[sprint.id] ? '▶' : '▼'}</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{sprint.name}</span>
            <Badge cls={sprint.status === 'ACTIVE' ? 'bg-amber-500/20 text-amber-300' : sprint.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}>
              {sprint.status}
            </Badge>
            <span className="text-xs text-[var(--text-tertiary)]">{(sprintIssues[sprint.id] || []).length} issues</span>
            {sprint.startDate && <span className="text-xs text-[var(--text-tertiary)]">{sprint.startDate} → {sprint.endDate}</span>}
            <div className="ml-auto flex gap-2" onClick={e => e.stopPropagation()}>
              {sprint.status === 'PLANNED'   && <button className="plane-btn-primary text-xs py-1"  onClick={() => sprintAction(sprint.id, 'start')}>Start Sprint</button>}
              {sprint.status === 'ACTIVE'    && <button className="plane-btn-secondary text-xs py-1" onClick={() => sprintAction(sprint.id, 'complete')}>Complete</button>}
            </div>
          </div>
          {!collapsed[sprint.id] && (
            <>
              {(sprintIssues[sprint.id] || []).map(i => <IssueRow key={i.id} issue={i} />)}
              {!(sprintIssues[sprint.id] || []).length && (
                <div className="px-4 py-3 text-xs text-[var(--text-tertiary)] border-t border-[var(--border-subtle)]">No issues in this sprint.</div>
              )}
            </>
          )}
        </div>
      ))}

      <div className="plane-card overflow-hidden p-0">
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors"
          onClick={() => setCollapsed(c => ({ ...c, backlog: !c.backlog }))}>
          <span className="text-[var(--text-tertiary)] text-xs">{collapsed.backlog ? '▶' : '▼'}</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">Backlog</span>
          <span className="text-xs text-[var(--text-tertiary)]">{backlog.length} issues</span>
        </div>
        {!collapsed.backlog && (
          <>
            {backlog.map(i => <IssueRow key={i.id} issue={i} />)}
            {!backlog.length && <div className="px-4 py-3 text-xs text-[var(--text-tertiary)] border-t border-[var(--border-subtle)]">Backlog is empty.</div>}
          </>
        )}
      </div>

      {showCreate && board && (
        <CreateIssueModal boardId={board.id} projectId={projectId} onClose={() => setShowCreate(false)}
          onCreated={i => { setBacklog(b => [...b, i]); setShowCreate(false) }} />
      )}
    </div>
  )
}
