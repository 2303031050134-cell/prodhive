import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Badge, priorityBadge, typeBadge, Spinner, Empty } from '../components/ui'
import CreateIssueModal from '../components/CreateIssueModal'

const COLS = [
  { id: 'TODO',        label: 'To Do',       color: 'text-slate-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'text-amber-400' },
  { id: 'IN_REVIEW',   label: 'In Review',   color: 'text-purple-400' },
  { id: 'DONE',        label: 'Done',        color: 'text-emerald-400' },
]

export default function BoardPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [boards, setBoards] = useState([])
  const [board, setBoard] = useState(null)
  const [sprints, setSprints] = useState([])
  const [sprintId, setSprintId] = useState('')
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [createCol, setCreateCol] = useState(null)
  const [filters, setFilters] = useState({ type: '', priority: '' })
  const [dragId, setDragId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  const loadIssues = async (bid, sid) => {
    const params = new URLSearchParams({ boardId: bid })
    if (sid) params.set('sprintId', sid)
    const { data } = await CORE.get(`/issues?${params}`)
    setIssues(data)
  }

  useEffect(() => {
    CORE.get(`/boards?projectId=${projectId}`).then(async r => {
      const uniqueBoards = Array.from(new Map(r.data.map(b => [b.id, b])).values())
      setBoards(uniqueBoards)
      if (!uniqueBoards.length) { setLoading(false); return }
      const b = uniqueBoards[0]; setBoard(b)
      const sp = await CORE.get(`/sprints?boardId=${b.id}`)
      setSprints(sp.data)
      const active = sp.data.find(s => s.status === 'ACTIVE')
      const sid = active?.id || ''
      setSprintId(sid)
      await loadIssues(b.id, sid)
    }).catch(() => toast('Failed to load board', 'error')).finally(() => setLoading(false))
  }, [projectId])

  const onBoardChange = async bid => {
    const b = boards.find(x => x.id == bid); setBoard(b)
    const sp = await CORE.get(`/sprints?boardId=${bid}`)
    setSprints(sp.data)
    const active = sp.data.find(s => s.status === 'ACTIVE')
    const sid = active?.id || ''; setSprintId(sid)
    await loadIssues(bid, sid)
  }

  const onSprintChange = async sid => { setSprintId(sid); await loadIssues(board.id, sid) }

  const colIssues = col => issues
    .filter(i => i.status === col)
    .filter(i => !filters.type || i.type === filters.type)
    .filter(i => !filters.priority || i.priority === filters.priority)
    .sort((a, b) => a.rank - b.rank)

  const handleDrop = async (col, dropIndex) => {
    const id = dragId
    setDragId(null); setDragOverCol(null)
    if (!id) return
    const dragged = issues.find(i => i.id === id)
    if (!dragged) return

    const target = colIssues(col).filter(i => i.id !== id)
    const clampedIndex = Math.max(0, Math.min(dropIndex, target.length))
    const prevRank = clampedIndex > 0 ? target[clampedIndex - 1].rank : null
    const nextRank = clampedIndex < target.length ? target[clampedIndex].rank : null
    let newRank
    if (prevRank == null && nextRank == null) newRank = 1000
    else if (prevRank == null) newRank = nextRank - 1000
    else if (nextRank == null) newRank = prevRank + 1000
    else newRank = (prevRank + nextRank) / 2

    const statusChanged = dragged.status !== col
    // optimistic update
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: col, rank: newRank } : i))

    try {
      if (statusChanged) {
        const { data } = await CORE.patch(`/issues/${id}/status`, { status: col })
        setIssues(prev => prev.map(i => i.id === id ? { ...i, ...data, rank: newRank } : i))
      }
      const { data } = await CORE.patch(`/issues/${id}/rank`, { newRank })
      setIssues(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
    } catch {
      toast('Failed to move issue', 'error')
      await loadIssues(board.id, sprintId)
    }
  }

  const createBoard = async () => {
    try {
      const { data } = await CORE.post('/boards', { name: 'Main Board', projectId: Number(projectId) })
      setBoards([data]); setBoard(data); toast('Board created')
    } catch { toast('Failed', 'error') }
  }

  if (loading) return <Spinner />
  if (!board) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-sm text-[var(--text-tertiary)]">No board found for this project.</p>
      <button className="plane-btn-primary" onClick={createBoard}>Create Board</button>
    </div>
  )

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Board</h1>
        <select className="plane-input text-xs py-1" value={board?.id || ''} onChange={e => onBoardChange(e.target.value)}>
          {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className="plane-input text-xs py-1" value={sprintId} onChange={e => onSprintChange(e.target.value)}>
          <option value="">All Issues</option>
          {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
        </select>
        <select className="plane-input text-xs py-1" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          {['TASK','BUG','STORY','EPIC'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="plane-input text-xs py-1" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p}>{p}</option>)}
        </select>
        <div className="ml-auto flex gap-2">
          <a href={`/api/core/boards/${board.id}/export`} target="_blank" rel="noreferrer"
            className="plane-btn-secondary text-xs">↓ Export CSV</a>
          <button className="plane-btn-primary text-xs" onClick={() => setCreateCol('TODO')}>+ Create Issue</button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {COLS.map(col => {
          const items = colIssues(col.id)
          const isOver = dragOverCol === col.id
          return (
          <div key={col.id}
            onDragOver={e => { e.preventDefault(); setDragOverCol(col.id) }}
            onDragLeave={() => setDragOverCol(v => v === col.id ? null : v)}
            onDrop={e => { e.preventDefault(); handleDrop(col.id, items.length) }}
            className={`w-72 flex-shrink-0 flex flex-col bg-[var(--bg-surface-1)] border rounded-xl overflow-hidden transition-colors ${isOver ? 'border-[var(--accent-primary)]' : 'border-[var(--border-subtle)]'}`}>
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wide ${col.color}`}>{col.label}</span>
                <span className="text-[10px] bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] px-1.5 py-0.5 rounded font-bold">{items.length}</span>
              </div>
              <button onClick={() => setCreateCol(col.id)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm leading-none">+</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {items.map((issue, idx) => (
                <div key={issue.id}>
                  <div
                    draggable
                    onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragId(issue.id) }}
                    onDragEnd={() => { setDragId(null); setDragOverCol(null) }}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverCol(col.id) }}
                    onDrop={e => { e.preventDefault(); e.stopPropagation(); handleDrop(col.id, idx) }}
                    onClick={() => navigate(`/app/issues/${issue.id}`)}
                    className={`bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[var(--accent-primary)] transition-colors group ${dragId === issue.id ? 'opacity-40' : ''}`}>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-mono mb-1">{issue.issueKey}</p>
                    <p className="text-xs text-[var(--text-primary)] font-medium leading-snug mb-2">{issue.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Badge cls={typeBadge(issue.type)}>{issue.type}</Badge>
                        <Badge cls={priorityBadge(issue.priority)}>{issue.priority}</Badge>
                      </div>
                      {issue.assigneeId && (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[9px] font-bold">
                          {issue.assigneeId}
                        </div>
                      )}
                    </div>
                    {issue.labels?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {issue.labels.map(l => (
                          <span key={l.id} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: l.color + '33', color: l.color }}>{l.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="h-16 flex items-center justify-center text-[10px] text-[var(--text-tertiary)] border border-dashed border-[var(--border-subtle)] rounded-lg">
                  Drop here
                </div>
              )}
            </div>
          </div>
        )})}
      </div>

      {createCol && board && (
        <CreateIssueModal boardId={board.id} sprintId={sprintId || null} defaultStatus={createCol} projectId={projectId}
          onClose={() => setCreateCol(null)}
          onCreated={i => { setIssues(p => [...p, i]); setCreateCol(null) }} />
      )}
    </div>
  )
}
