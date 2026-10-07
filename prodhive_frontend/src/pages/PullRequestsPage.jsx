import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Badge, prBadge, Spinner, Empty } from '../components/ui'
import ReviewPanel from '../components/ReviewPanel'
import ReviewerPicker from '../components/ReviewerPicker'
import ActivityTimeline from '../components/ActivityTimeline'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const PR_HEX = { OPEN: '#3f76ff', MERGED: '#a855f7', CLOSED: '#ef4444' }
const REVIEW_HEX = { APPROVED: '#10b981', CHANGES_REQUESTED: '#ef4444', PENDING: '#f59e0b' }
const tooltipStyle = { backgroundColor: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 11 }

export default function PullRequestsPage() {
  const { projectId } = useParams()
  const toast = useToast()
  const [prs, setPrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [reviewsByPr, setReviewsByPr] = useState({})
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    CORE.get(`/projects/${projectId}/pull-requests`)
      .then(r => setPrs(r.data))
      .catch(() => toast('Failed to load pull requests', 'error'))
      .finally(() => setLoading(false))
  }, [projectId])

  // Load reviews for all PRs to power the analytics charts
  useEffect(() => {
    if (prs.length === 0) { setReviewsLoading(false); return }
    setReviewsLoading(true)
    Promise.all(prs.map(pr =>
      CORE.get(`/pull-requests/${pr.id}/reviews`).then(r => [pr.id, r.data]).catch(() => [pr.id, []])
    )).then(entries => setReviewsByPr(Object.fromEntries(entries)))
      .finally(() => setReviewsLoading(false))
  }, [prs])

  const open   = prs.filter(p => p.status === 'OPEN').length
  const merged = prs.filter(p => p.status === 'MERGED').length
  const closed = prs.filter(p => p.status === 'CLOSED').length

  const statusData = useMemo(() => (
    [['OPEN', open], ['MERGED', merged], ['CLOSED', closed]]
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  ), [open, merged, closed])

  const allReviews = useMemo(() => Object.values(reviewsByPr).flat(), [reviewsByPr])

  const reviewOutcomeData = useMemo(() => {
    const counts = { APPROVED: 0, CHANGES_REQUESTED: 0, PENDING: 0 }
    allReviews.forEach(r => { counts[r.state] = (counts[r.state] || 0) + 1 })
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.replace('_', ' '), key: name, value }))
  }, [allReviews])

  const reviewerActivity = useMemo(() => {
    const counts = {}
    allReviews.forEach(r => { counts[r.reviewerUserId] = (counts[r.reviewerUserId] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, value]) => ({ name: `User #${id}`, value }))
  }, [allReviews])

  const prsAwaitingReview = useMemo(() => prs.filter(pr => {
    const reviews = reviewsByPr[pr.id] || []
    return pr.status === 'OPEN' && reviews.length === 0
  }).length, [prs, reviewsByPr])

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Pull Requests</h1>
        <p className="text-xs text-[var(--text-tertiary)]">Linked automatically via GitHub webhook</p>
      </div>

      {prs.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['Open', open, 'text-[var(--accent-primary)]'], ['Merged', merged, 'text-purple-400'], ['Closed', closed, 'text-red-400'], ['Awaiting Review', prsAwaitingReview, 'text-amber-400']].map(([l, v, c]) => (
              <div key={l} className="plane-card p-4">
                <div className={`text-2xl font-bold ${c}`}>{v}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">{l}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="plane-card p-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">PR Status</h2>
              {statusData.length === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {statusData.map(d => <Cell key={d.name} fill={PR_HEX[d.name] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="plane-card p-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Review Outcomes</h2>
              {reviewsLoading ? <EmptyChart text="Loading…" /> : reviewOutcomeData.length === 0 ? <EmptyChart text="No reviews submitted yet." /> : (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={reviewOutcomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {reviewOutcomeData.map(d => <Cell key={d.key} fill={REVIEW_HEX[d.key] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="plane-card p-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Reviews by Reviewer</h2>
              {reviewsLoading ? <EmptyChart text="Loading…" /> : reviewerActivity.length === 0 ? <EmptyChart text="No reviews submitted yet." /> : (
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={reviewerActivity} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#3f76ff" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}

      {prs.length === 0 ? (
        <div className="plane-card p-8 text-center space-y-2">
          <p className="text-sm text-[var(--text-tertiary)]">No pull requests linked yet.</p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Connect a GitHub repo in <strong className="text-[var(--text-secondary)]">Project Settings → GitHub</strong> and include the issue key in your PR title (e.g.{' '}
            <code className="bg-[var(--bg-surface-2)] px-1.5 py-0.5 rounded text-[var(--text-primary)]">PROJ-42 fix login bug</code>).
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {prs.map(pr => {
            const reviews = reviewsByPr[pr.id] || []
            const approved = reviews.filter(r => r.state === 'APPROVED').length
            const changes = reviews.filter(r => r.state === 'CHANGES_REQUESTED').length
            return (
            <div key={pr.id} className="plane-card overflow-hidden p-0">
              <div className="px-4 py-3 cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors"
                onClick={() => setExpandedId(v => v === pr.id ? null : pr.id)}>
                <div className="flex items-center gap-3">
                  <span className={`text-base ${pr.status === 'MERGED' ? 'text-purple-400' : pr.status === 'CLOSED' ? 'text-red-400' : 'text-[var(--accent-primary)]'}`}>⎇</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono flex-shrink-0">#{pr.ghNumber}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] flex-1 truncate">{pr.title}</span>
                  {pr.issue && (
                    <span className="text-[10px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2 py-0.5 rounded font-bold flex-shrink-0">
                      ⟶ {pr.issue.issueKey}
                    </span>
                  )}
                  {approved > 0 && <span className="text-[10px] text-emerald-400 font-bold flex-shrink-0">✓ {approved}</span>}
                  {changes > 0 && <span className="text-[10px] text-red-400 font-bold flex-shrink-0">✗ {changes}</span>}
                  <Badge cls={prBadge(pr.status)}>{pr.status}</Badge>
                  <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">{new Date(pr.linkedAt).toLocaleDateString()}</span>
                  <span className="text-[var(--text-tertiary)] text-xs flex-shrink-0">{expandedId === pr.id ? '▲' : '▼'}</span>
                </div>
                {(pr.authorUsername || pr.branchName) && (
                  <div className="flex items-center gap-3 mt-1.5 pl-7 text-[10px] text-[var(--text-tertiary)]">
                    {pr.authorUsername && <span>👤 {pr.authorUsername}</span>}
                    {pr.branchName && <span>🌿 {pr.branchName}{pr.baseBranch ? ` → ${pr.baseBranch}` : ''}</span>}
                    {(pr.additions != null || pr.deletions != null) && (
                      <span>
                        {pr.additions != null && <span className="text-emerald-400">+{pr.additions}</span>}
                        {pr.deletions != null && <span className="text-red-400 ml-1">−{pr.deletions}</span>}
                        {pr.changedFiles != null && <span className="ml-1">· {pr.changedFiles} file{pr.changedFiles === 1 ? '' : 's'}</span>}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {expandedId === pr.id && (
                <div className="border-t border-[var(--border-subtle)] p-4 bg-[var(--bg-canvas)] space-y-5">
                  {pr.prUrl && (
                    <a href={pr.prUrl} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent-primary)] hover:underline">
                      Open on GitHub ↗
                    </a>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReviewerPicker projectId={projectId} prId={pr.id} />
                    <ActivityTimeline issueId={pr.issue?.id} />
                  </div>
                  <ReviewPanel prId={pr.id} onReviewSubmitted={(id, review) =>
                    setReviewsByPr(prev => ({ ...prev, [id]: [...(prev[id] || []), review] }))
                  } />
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  )
}

function EmptyChart({ text = 'No data yet.' }) {
  return <div className="flex items-center justify-center h-[190px] text-xs text-[var(--text-tertiary)]">{text}</div>
}
