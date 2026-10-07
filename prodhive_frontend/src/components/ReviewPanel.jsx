import { useState, useEffect } from 'react'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'


const STATE_META = {
  APPROVED:          { label: 'Approved',          color: 'text-emerald-400', border: 'border-emerald-500/30', icon: '✓' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'text-red-400',     border: 'border-red-500/30',     icon: '✗' },
  PENDING:           { label: 'Pending',            color: 'text-amber-400',   border: 'border-amber-500/30',   icon: '◌' },
}

export default function ReviewPanel({ prId, onReviewSubmitted }) {
  const toast = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ state: 'APPROVED', comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    CORE.get(`/pull-requests/${prId}/reviews`)
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [prId])

  const submit = async e => {
    e.preventDefault()
    if (!form.comment.trim()) { toast('Comment is required', 'error'); return }
    setSubmitting(true)
    try {
      const { data } = await CORE.post(`/pull-requests/${prId}/reviews`, form)
      setReviews(r => [...r, data])
      setForm({ state: 'APPROVED', comment: '' })
      toast('Review submitted')
      onReviewSubmitted?.(prId, data)
    } catch { toast('Failed to submit review', 'error') }
    finally { setSubmitting(false) }
  }

  const approved = reviews.filter(r => r.state === 'APPROVED').length
  const changes  = reviews.filter(r => r.state === 'CHANGES_REQUESTED').length

  return (
    <div className="space-y-4">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 px-3 py-2 bg-[var(--bg-surface-2)] rounded-lg text-xs">
          <span className="text-[var(--text-tertiary)]">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          {approved > 0 && <span className="text-emerald-400 font-medium">✓ {approved} approved</span>}
          {changes  > 0 && <span className="text-red-400 font-medium">✗ {changes} changes requested</span>}
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-[var(--text-tertiary)]">No reviews yet.</p>
      ) : (
        <div className="space-y-2">
          {reviews.map(r => {
            const meta = STATE_META[r.state] || STATE_META.PENDING
            return (
              <div key={r.id} className={`p-3 rounded-lg border ${meta.border} bg-[var(--bg-surface-2)]`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs font-bold ${meta.color}`}>{meta.icon} {meta.label}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">
                    Reviewer #{r.reviewerUserId} · {new Date(r.submittedAt).toLocaleString()}
                  </span>
                </div>
                {r.comment && <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{r.comment}</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Submit form */}
      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">Submit Review</p>
        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-2">
            {Object.entries(STATE_META).map(([key, meta]) => (
              <button key={key} type="button" onClick={() => setForm(f => ({ ...f, state: key }))}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all ${
                  form.state === key
                    ? `${meta.border} ${meta.color} bg-[var(--bg-surface-2)]`
                    : 'border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)]'
                }`}>
                {meta.icon} {meta.label}
              </button>
            ))}
          </div>
          <textarea className="plane-input w-full text-xs resize-none h-16" placeholder="Leave a review comment…"
            value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="plane-btn-primary text-xs">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
