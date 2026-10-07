import { useState, useEffect } from 'react';
import api from '@/shared/api/client';
import { useToast } from '@/shared/components/Toast';

const STATE_META = {
  APPROVED:           { label: 'Approved',           color: 'var(--accent)',   bg: 'rgba(0,201,167,.12)',  icon: '✓' },
  CHANGES_REQUESTED:  { label: 'Changes Requested',  color: 'var(--danger)',   bg: 'rgba(240,82,82,.12)',  icon: '✗' },
  PENDING:            { label: 'Pending',             color: 'var(--warning)',  bg: 'rgba(245,158,11,.12)', icon: '◌' },
};

export default function ReviewPanel({ prId, onReviewSubmitted }) {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ state: 'APPROVED', comment: '' });

  useEffect(() => {
    if (!prId) return;
    api.get(`/core/pull-requests/${prId}/reviews`)
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [prId]);

  const submit = async e => {
    e.preventDefault();
    if (!form.comment.trim()) { toast('Comment is required', 'error'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/core/pull-requests/${prId}/reviews`, form);
      setReviews(r => [...r, data]);
      setForm({ state: 'APPROVED', comment: '' });
      toast('Review submitted');
      onReviewSubmitted?.(data);
    } catch {
      toast('Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const approved = reviews.filter(r => r.state === 'APPROVED').length;
  const changesReq = reviews.filter(r => r.state === 'CHANGES_REQUESTED').length;

  return (
    <div>
      {/* Summary bar */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          {approved > 0 && (
            <span style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ {approved} approved
            </span>
          )}
          {changesReq > 0 && (
            <span style={{ fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
              ✗ {changesReq} changes requested
            </span>
          )}
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <div className="spinner" />
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>No reviews yet</div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          {reviews.map(r => {
            const meta = STATE_META[r.state] || STATE_META.PENDING;
            return (
              <div key={r.id} style={{
                padding: '12px 14px', marginBottom: 8,
                background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
                borderLeft: `3px solid ${meta.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div className="avatar" style={{ width: 22, height: 22, fontSize: 9, background: meta.color, color: '#0f1117' }}>
                    {meta.icon}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>{meta.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    Reviewer #{r.reviewerUserId} · {new Date(r.submittedAt).toLocaleString()}
                  </span>
                </div>
                {r.comment && (
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, paddingLeft: 30 }}>
                    {r.comment}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit form */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 12 }}>
          Submit Review
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {Object.entries(STATE_META).map(([key, meta]) => (
              <button key={key} type="button"
                onClick={() => setForm(f => ({ ...f, state: key }))}
                style={{
                  flex: 1, padding: '8px 6px', borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${form.state === key ? meta.color : 'var(--border)'}`,
                  background: form.state === key ? meta.bg : 'var(--bg3)',
                  color: form.state === key ? meta.color : 'var(--text-muted)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                <span>{meta.icon}</span> {meta.label}
              </button>
            ))}
          </div>
          <textarea
            className="input"
            placeholder="Leave a review comment..."
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            style={{ minHeight: 72, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
