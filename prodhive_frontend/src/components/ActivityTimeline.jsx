import { useState, useEffect } from 'react'
import { CORE } from '../services/api'

const ICON = {
  PR_OPENED: '🟣', PR_UPDATED: '🟡', PR_MERGED: '🟢', PR_CLOSED: '🔴',
  STATUS_CHANGED: '🔵', REVIEW_APPROVED: '✅', CHANGES_REQUESTED: '🟠',
  REVIEW_SUBMITTED: '💬', REVIEW_REQUESTED: '👋',
}

/** Shows the activity log for a single issue — this is what powers the "development
 *  activity" story on a PR, built from the same ActivityLog entries the webhook
 *  processor already writes, rather than exposing raw webhook deliveries. */
export default function ActivityTimeline({ issueId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!issueId) { setLoading(false); return }
    CORE.get(`/issues/${issueId}/activity`)
      .then(r => setEvents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [issueId])

  if (!issueId) return null
  if (loading) return <p className="text-xs text-[var(--text-tertiary)]">Loading activity…</p>
  if (events.length === 0) return <p className="text-xs text-[var(--text-tertiary)]">No activity yet.</p>

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Development activity</div>
      <div className="space-y-2.5">
        {[...events].reverse().map(e => (
          <div key={e.id} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5">{ICON[e.action] || '•'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[var(--text-primary)]">{e.detail || e.action.replace(/_/g, ' ')}</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">{new Date(e.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
