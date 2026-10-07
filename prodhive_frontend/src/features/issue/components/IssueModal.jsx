import { useState, useEffect } from 'react';
import api from '@/shared/api/client';
import { statusBadge, priorityBadge, typeBadge, statusLabel } from '@/shared/utils/badges';
import { useToast } from '@/shared/components/Toast';
import ReviewPanel from '@/features/review/components/ReviewPanel';

const STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'REOPENED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function IssueModal({ issueId, onClose, onUpdated }) {
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.get(`/core/issues/${issueId}`),
      api.get(`/core/issues/${issueId}/comments`),
    ]).then(([i, c]) => {
      setIssue(i.data);
      setComments(c.data);
    }).catch(() => toast('Failed to load issue', 'error'))
      .finally(() => setLoading(false));
  }, [issueId]);

  const updateStatus = async status => {
    const { data } = await api.patch(`/core/issues/${issueId}/status`, { status });
    setIssue(data);
    onUpdated?.(data);
    toast('Status updated');
  };

  const addComment = async e => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const { data } = await api.post(`/core/issues/${issueId}/comments`, { content: newComment });
    setComments(c => [...c, data]);
    setNewComment('');
  };

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div className="spinner" />
      </div>
    </div>
  );

  if (!issue) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 760 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`badge ${typeBadge(issue.type)}`}>{issue.type}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{issue.issueKey}</span>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 16 }}>{issue.title}</h2>

          <div className="tabs">
            {['details', 'comments', 'pull-requests', 'history'].map(t => (
              <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'pull-requests' ? 'Pull Requests' : t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
            ))}
          </div>

          {tab === 'details' && (
            <div className="issue-detail-grid">
              <div>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 16 }}>
                  {issue.description || <span style={{ color: 'var(--text-muted)' }}>No description</span>}
                </div>
              </div>
              <div>
                <div className="issue-meta-row">
                  <span className="issue-meta-label">Status</span>
                  <select className="input" style={{ width: 'auto', fontSize: 12, padding: '3px 8px' }}
                    value={issue.status} onChange={e => updateStatus(e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </div>
                <div className="issue-meta-row">
                  <span className="issue-meta-label">Priority</span>
                  <span className={`badge ${priorityBadge(issue.priority)}`}>{issue.priority}</span>
                </div>
                <div className="issue-meta-row">
                  <span className="issue-meta-label">Type</span>
                  <span className={`badge ${typeBadge(issue.type)}`}>{issue.type}</span>
                </div>
                <div className="issue-meta-row">
                  <span className="issue-meta-label">Assignee</span>
                  <span style={{ fontSize: 12 }}>{issue.assigneeId ? `User #${issue.assigneeId}` : 'Unassigned'}</span>
                </div>
                <div className="issue-meta-row">
                  <span className="issue-meta-label">Reporter</span>
                  <span style={{ fontSize: 12 }}>User #{issue.reporterId}</span>
                </div>
                <div className="issue-meta-row">
                  <span className="issue-meta-label">Created</span>
                  <span style={{ fontSize: 12 }}>{new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
                {issue.labels?.length > 0 && (
                  <div className="issue-meta-row">
                    <span className="issue-meta-label">Labels</span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {issue.labels.map(l => (
                        <span key={l.id} className="badge" style={{ background: l.color + '22', color: l.color }}>{l.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'comments' && (
            <div>
              {comments.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>No comments yet</div>
              ) : (
                comments.map(c => (
                  <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>U</div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text)', paddingLeft: 30 }}>{c.content}</div>
                  </div>
                ))
              )}
              <form onSubmit={addComment} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <textarea className="input" placeholder="Add a comment..." value={newComment}
                  onChange={e => setNewComment(e.target.value)} style={{ minHeight: 60, flex: 1 }} />
                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>Post</button>
              </form>
            </div>
          )}

          {tab === 'pull-requests' && <IssuePullRequests issueId={issueId} />}
          {tab === 'history' && <IssueHistory issueId={issueId} />}
        </div>
      </div>
    </div>
  );
}

function IssuePullRequests({ issueId }) {
  const [prs, setPrs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // uses the new /by-issue/{issueId} endpoint on the project PR controller
    // We don't have projectId here so we use a dedicated route
    api.get(`/core/issues/${issueId}/pull-requests`)
      .then(r => setPrs(r.data))
      .catch(() => {});
  }, [issueId]);

  const prBadge = s => ({ OPEN: 'badge-inprogress', MERGED: 'badge-done', CLOSED: 'badge-reopened' }[s] || 'badge-todo');
  const prColor = s => ({ OPEN: 'var(--info)', MERGED: 'var(--purple)', CLOSED: 'var(--danger)' }[s] || 'var(--text-muted)');

  if (prs.length === 0) return (
    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
      No pull requests linked to this issue.
      <div style={{ marginTop: 6, fontSize: 12 }}>Include the issue key in your PR title (e.g. <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 3 }}>PROJ-42 fix bug</code>) and it will be linked automatically via webhook.</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {prs.map(pr => (
        <div key={pr.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: 'var(--bg3)' }}
            onClick={() => setExpandedId(prev => prev === pr.id ? null : pr.id)}
          >
            <span style={{ color: prColor(pr.status), fontSize: 14 }}>⎇</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{pr.ghNumber}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pr.title}</span>
            <span className={`badge ${prBadge(pr.status)}`}>{pr.status}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, transition: 'transform .2s', transform: expandedId === pr.id ? 'rotate(180deg)' : 'none' }}>▼</span>
          </div>
          {expandedId === pr.id && (
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
              <ReviewPanel prId={pr.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function IssueHistory({ issueId }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    api.get(`/core/issues/${issueId}/history`).then(r => setHistory(r.data)).catch(() => {});
  }, [issueId]);

  return (
    <div>
      {history.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No history</div>
      ) : (
        history.map((h, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)', minWidth: 140 }}>{new Date(h.changedAt).toLocaleString()}</span>
            <span style={{ color: 'var(--text)' }}>
              <span className={`badge ${statusBadge(h.fromStatus)}`}>{statusLabel(h.fromStatus)}</span>
              {' → '}
              <span className={`badge ${statusBadge(h.toStatus)}`}>{statusLabel(h.toStatus)}</span>
            </span>
          </div>
        ))
      )}
    </div>
  );
}
