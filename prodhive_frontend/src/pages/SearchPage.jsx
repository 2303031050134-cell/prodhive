import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Badge, statusBadge, priorityBadge, typeBadge, STATUS_LABEL } from '../components/ui'

export default function SearchPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [projectId, setProjectId] = useState('')
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const search = async e => {
    e.preventDefault()
    if (!projectId || !q.trim()) { toast('Enter a project ID and search term', 'error'); return }
    setLoading(true)
    try {
      const { data } = await CORE.get(`/search?projectId=${projectId}&q=${encodeURIComponent(q)}`)
      setResults(data); setSearched(true)
    } catch { toast('Search failed', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-xl font-bold text-[var(--text-primary)]">Search Issues</h1>

      <form onSubmit={search} className="flex gap-2">
        <input className="plane-input text-xs w-28" type="number" placeholder="Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} required />
        <input className="plane-input text-xs flex-1" placeholder="Search issues by title, key, description…" value={q} onChange={e => setQ(e.target.value)} required />
        <button type="submit" disabled={loading} className="plane-btn-primary text-xs">{loading ? 'Searching…' : 'Search'}</button>
      </form>

      {searched && (
        results.length === 0
          ? <p className="text-sm text-[var(--text-tertiary)]">No results found for "{q}".</p>
          : (
            <div className="plane-card overflow-hidden p-0">
              <div className="px-4 py-2 border-b border-[var(--border-subtle)]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{results.length} result{results.length !== 1 ? 's' : ''}</span>
              </div>
              {results.map(issue => (
                <div key={issue.id} onClick={() => navigate(`/app/issues/${issue.id}`)}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors">
                  <Badge cls={typeBadge(issue.type)}>{issue.type}</Badge>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono w-20 flex-shrink-0">{issue.issueKey}</span>
                  <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{issue.title}</span>
                  <Badge cls={statusBadge(issue.status)}>{STATUS_LABEL(issue.status)}</Badge>
                  <Badge cls={priorityBadge(issue.priority)}>{issue.priority}</Badge>
                </div>
              ))}
            </div>
          )
      )}

    </div>
  )
}
