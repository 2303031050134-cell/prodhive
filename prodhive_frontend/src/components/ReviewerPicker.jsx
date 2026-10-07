import { useState, useEffect } from 'react'
import { CORE } from '../services/api'
import { fetchUsers, initialsOf } from '../services/userDirectory'
import { useToast } from '../context/ToastContext'
import { Badge, reviewerStatusBadge } from './ui'

/**
 * Shows the reviewers currently requested on a PR, plus a small picker to request
 * another project member. Members without a linked GitHub username are shown but
 * disabled, since GitHub has no way to request a review from someone it can't identify.
 */
export default function ReviewerPicker({ projectId, prId, onChanged }) {
  const toast = useToast()
  const [reviewers, setReviewers] = useState([])
  const [members, setMembers] = useState([])
  const [names, setNames] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [picking, setPicking] = useState(false)
  const [requestingId, setRequestingId] = useState(null)

  const load = async () => {
    try {
      const [reviewersRes, membersRes] = await Promise.all([
        CORE.get(`/pull-requests/${prId}/reviewers`),
        CORE.get(`/projects/${projectId}/members`),
      ])
      setReviewers(reviewersRes.data)
      setMembers(membersRes.data)
      setNames(await fetchUsers(membersRes.data.map(m => m.userId)))
    } catch {
      toast('Failed to load reviewers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [prId])

  const alreadyRequestedIds = new Set(reviewers.map(r => r.userId).filter(Boolean))
  const candidates = members.filter(m => !alreadyRequestedIds.has(m.userId))

  const requestReviewer = async (userId) => {
    const person = names.get(userId)
    if (!person?.githubUsername) {
      toast('This member has no GitHub username linked yet', 'error')
      return
    }
    setRequestingId(userId)
    try {
      const { data } = await CORE.post(`/pull-requests/${prId}/reviewers`, {
        userId, githubUsername: person.githubUsername,
      })
      setReviewers(r => [...r, data.reviewer])
      setPicking(false)
      if (data.githubSynced) {
        toast(`${person.fullName} requested as reviewer`)
      } else {
        toast(`${person.fullName} added as reviewer (not synced to GitHub — check write access)`, 'error')
      }
      onChanged?.()
    } catch {
      toast('Failed to request reviewer', 'error')
    } finally {
      setRequestingId(null)
    }
  }

  if (loading) return <p className="text-xs text-[var(--text-tertiary)]">Loading reviewers…</p>

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Reviewers</div>

      {reviewers.length === 0 && (
        <p className="text-xs text-[var(--text-tertiary)]">No reviewers requested yet.</p>
      )}

      <div className="space-y-1.5">
        {reviewers.map(r => {
          const person = r.userId ? names.get(r.userId) : null
          const label = person?.fullName || r.githubUsername
          return (
            <div key={r.id} className="flex items-center gap-2 text-xs">
              <span className="w-6 h-6 rounded-full bg-[var(--bg-surface-2)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">
                {initialsOf(label)}
              </span>
              <span className="flex-1 text-[var(--text-primary)]">{label}</span>
              <span className="text-[var(--text-tertiary)]">@{r.githubUsername}</span>
              <Badge cls={reviewerStatusBadge(r.status)}>{r.status.replace('_', ' ')}</Badge>
            </div>
          )
        })}
      </div>

      {picking ? (
        <div className="mt-2 rounded-lg border border-[var(--border-subtle)] p-2 space-y-1 max-h-40 overflow-y-auto">
          {candidates.length === 0 && <p className="text-xs text-[var(--text-tertiary)] px-1 py-1">No other members to add.</p>}
          {candidates.map(m => {
            const person = names.get(m.userId)
            const linked = !!person?.githubUsername
            return (
              <button key={m.userId} disabled={!linked || requestingId === m.userId}
                onClick={() => requestReviewer(m.userId)}
                className="w-full flex items-center gap-2 text-xs text-left px-2 py-1.5 rounded hover:bg-[var(--bg-surface-2)] disabled:opacity-40 disabled:cursor-not-allowed">
                <span className="w-5 h-5 rounded-full bg-[var(--bg-surface-2)] flex items-center justify-center text-[9px] font-bold text-[var(--text-secondary)]">
                  {initialsOf(person?.fullName)}
                </span>
                <span className="flex-1 text-[var(--text-primary)]">{person?.fullName || `User #${m.userId}`}</span>
                <span className="text-[var(--text-tertiary)]">{linked ? `@${person.githubUsername}` : 'no GitHub username linked'}</span>
              </button>
            )
          })}
          <button onClick={() => setPicking(false)} className="text-[11px] text-[var(--text-tertiary)] hover:underline px-1">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setPicking(true)} className="text-xs text-[var(--accent-primary)] hover:underline">+ Add reviewer</button>
      )}
    </div>
  )
}
