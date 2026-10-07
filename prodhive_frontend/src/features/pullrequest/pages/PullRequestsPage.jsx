import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/shared/api/client';
import { useToast } from '@/shared/components/Toast';
import ReviewPanel from '@/features/review/components/ReviewPanel';

const prBadge = status => ({
  OPEN:   'badge-inprogress',
  MERGED: 'badge-done',
  CLOSED: 'badge-reopened',
}[status] || 'badge-todo');

const prIcon = status => ({
  OPEN:   { icon: '⎇', color: 'var(--info)' },
  MERGED: { icon: '⎇', color: 'var(--purple)' },
  CLOSED: { icon: '⎇', color: 'var(--danger)' },
}[status] || { icon: '⎇', color: 'var(--text-muted)' });

export default function PullRequestsPage() {
  const { projectId } = useParams();
  const toast = useToast();
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get(`/core/projects/${projectId}/pull-requests`)
      .then(r => setPrs(r.data))
      .catch(() => toast('Failed to load pull requests', 'error'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const toggle = id => setExpandedId(prev => prev === id ? null : id);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Pull Requests</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Linked automatically via GitHub webhook
        </div>
      </div>

      {/* Stats row */}
      {prs.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {['OPEN', 'MERGED', 'CLOSED'].map(s => {
            const count = prs.filter(p => p.status === s).length;
            const { color } = prIcon(s);
            return (
              <div key={s} className="card" style={{ flex: 1, padding: '12px 16px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s}</div>
              </div>
            );
          })}
        </div>
      )}

      {prs.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/>
            <path d="M6 9v6M18 9a9 9 0 01-9 9"/>
          </svg>
          <p>No pull requests linked yet.</p>
          <p style={{ fontSize: 12 }}>Connect a GitHub repo in Project Settings and push a PR with the issue key in the title (e.g. <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 3 }}>PROJ-42 fix login bug</code>)</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {prs.map(pr => {
            const { color } = prIcon(pr.status);
            const isExpanded = expandedId === pr.id;
            return (
              <div key={pr.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* PR row header */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    cursor: 'pointer', transition: 'background .1s',
                  }}
                  onClick={() => toggle(pr.id)}
                >
                  {/* Status icon */}
                  <span style={{ fontSize: 16, color, flexShrink: 0 }}>⎇</span>

                  {/* PR number + title */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        #{pr.ghNumber}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pr.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span className={`badge ${prBadge(pr.status)}`}>{pr.status}</span>
                      {/* Linked issue chip */}
                      {pr.issue && (
                        <span style={{
                          fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)',
                          padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                        }}>
                          ⟶ {pr.issue.issueKey}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Linked {new Date(pr.linkedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <span style={{ color: 'var(--text-muted)', fontSize: 12, flexShrink: 0, transition: 'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                    ▼
                  </span>
                </div>

                {/* Expanded review panel */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'var(--bg)' }}>
                    <ReviewPanel
                      prId={pr.id}
                      onReviewSubmitted={() => {}}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
