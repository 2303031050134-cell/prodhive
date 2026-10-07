import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/shared/api/client';
import { useAuth } from '@/features/auth/store/authStore';
import { statusBadge, priorityBadge } from '@/shared/utils/badges';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myIssues, setMyIssues] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/core/dashboard/my-issues'),
      api.get('/core/dashboard/recent-activity'),
    ]).then(([i, a]) => {
      setMyIssues(i.data);
      setActivity(a.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const todo = myIssues.filter(i => i.status === 'TODO').length;
  const inProgress = myIssues.filter(i => i.status === 'IN_PROGRESS').length;
  const inReview = myIssues.filter(i => i.status === 'IN_REVIEW').length;
  const done = myIssues.filter(i => i.status === 'DONE').length;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Good day, {user?.fullName?.split(' ')[0]} 👋</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Here's what's on your plate</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{myIssues.length}</div>
          <div className="stat-label">Assigned to me</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-accent">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{inReview}</div>
          <div className="stat-label">In Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{done}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 14, fontSize: 14 }}>My Issues</div>
          {myIssues.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No issues assigned to you</div>
          ) : (
            myIssues.slice(0, 8).map(issue => (
              <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => navigate(`/app/projects/${issue.board?.project?.id || ''}/board`)}>

                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 70 }}>{issue.issueKey}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</span>
                <span className={`badge ${statusBadge(issue.status)}`}>{issue.status?.replace('_', ' ')}</span>
                <span className={`badge ${priorityBadge(issue.priority)}`}>{issue.priority}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: 14, fontSize: 14 }}>Recent Activity</div>
          {activity.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent activity</div>
          ) : (
            activity.slice(0, 8).map(a => (
              <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{a.description}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
