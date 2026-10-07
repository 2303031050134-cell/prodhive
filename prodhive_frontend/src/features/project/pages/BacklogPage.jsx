import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/shared/api/client';
import { statusBadge, priorityBadge, typeBadge, statusLabel } from '@/shared/utils/badges';
import IssueModal from '@/features/issue/components/IssueModal';
import CreateIssueModal from '@/features/issue/components/CreateIssueModal';
import { useToast } from '@/shared/components/Toast';

export default function BacklogPage() {
  const { projectId } = useParams();
  const toast = useToast();
  const [board, setBoard] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [backlogIssues, setBacklogIssues] = useState([]);
  const [sprintIssues, setSprintIssues] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/core/boards?projectId=${projectId}`).then(async r => {
      if (!r.data.length) { setLoading(false); return; }
      const b = r.data[0];
      setBoard(b);
      const [sprintsRes, backlogRes] = await Promise.all([
        api.get(`/core/sprints?boardId=${b.id}`),
        api.get(`/core/issues?boardId=${b.id}&backlogOnly=true`),
      ]);
      setSprints(sprintsRes.data);
      setBacklogIssues(backlogRes.data);
      const issueMap = {};
      await Promise.all(sprintsRes.data.map(async s => {
        const res = await api.get(`/core/issues?boardId=${b.id}&sprintId=${s.id}`);
        issueMap[s.id] = res.data;
      }));
      setSprintIssues(issueMap);
    }).catch(() => toast('Failed to load backlog', 'error'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const toggle = id => setCollapsed(c => ({ ...c, [id]: !c[id] }));

  const startSprint = async id => {
    try {
      await api.patch(`/core/sprints/${id}/start`);
      setSprints(s => s.map(x => x.id === id ? { ...x, status: 'ACTIVE' } : x));
      toast('Sprint started');
    } catch { toast('Failed to start sprint', 'error'); }
  };

  const completeSprint = async id => {
    try {
      await api.patch(`/core/sprints/${id}/complete`);
      setSprints(s => s.map(x => x.id === id ? { ...x, status: 'COMPLETED' } : x));
      toast('Sprint completed');
    } catch { toast('Failed to complete sprint', 'error'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!board) return <div className="empty-state"><p>No board found for this project.</p></div>;

  const IssueRow = ({ issue }) => (
    <div className="backlog-issue-row" onClick={() => setSelectedIssueId(issue.id)}>
      <span className={`badge ${typeBadge(issue.type)}`} style={{ fontSize: 10 }}>{issue.type}</span>
      <span className="backlog-issue-key">{issue.issueKey}</span>
      <span className="backlog-issue-title">{issue.title}</span>
      <span className={`badge ${statusBadge(issue.status)}`}>{statusLabel(issue.status)}</span>
      <span className={`badge ${priorityBadge(issue.priority)}`}>{issue.priority}</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Backlog</div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Issue</button>
      </div>

      {sprints.map(sprint => (
        <div key={sprint.id} className="backlog-sprint">
          <div className="backlog-sprint-header" onClick={() => toggle(sprint.id)}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{collapsed[sprint.id] ? '▶' : '▼'}</span>
            <span className="backlog-sprint-name">{sprint.name}</span>
            <span className={`badge ${sprint.status === 'ACTIVE' ? 'badge-inprogress' : sprint.status === 'COMPLETED' ? 'badge-done' : 'badge-todo'}`}>
              {sprint.status}
            </span>
            <span className="backlog-sprint-meta">{(sprintIssues[sprint.id] || []).length} issues</span>
            {sprint.startDate && <span className="backlog-sprint-meta">{sprint.startDate} → {sprint.endDate}</span>}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
              {sprint.status === 'PLANNED' && (
                <button className="btn btn-primary btn-sm" onClick={() => startSprint(sprint.id)}>Start Sprint</button>
              )}
              {sprint.status === 'ACTIVE' && (
                <button className="btn btn-ghost btn-sm" onClick={() => completeSprint(sprint.id)}>Complete</button>
              )}
            </div>
          </div>
          {!collapsed[sprint.id] && (sprintIssues[sprint.id] || []).map(i => <IssueRow key={i.id} issue={i} />)}
          {!collapsed[sprint.id] && (sprintIssues[sprint.id] || []).length === 0 && (
            <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>No issues in this sprint</div>
          )}
        </div>
      ))}

      <div className="backlog-sprint">
        <div className="backlog-sprint-header" onClick={() => toggle('backlog')}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{collapsed['backlog'] ? '▶' : '▼'}</span>
          <span className="backlog-sprint-name">Backlog</span>
          <span className="backlog-sprint-meta">{backlogIssues.length} issues</span>
        </div>
        {!collapsed['backlog'] && backlogIssues.map(i => <IssueRow key={i.id} issue={i} />)}
        {!collapsed['backlog'] && backlogIssues.length === 0 && (
          <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>Backlog is empty</div>
        )}
      </div>

      {selectedIssueId && (
        <IssueModal issueId={selectedIssueId} onClose={() => setSelectedIssueId(null)}
          onUpdated={updated => {
            setBacklogIssues(p => p.map(i => i.id === updated.id ? updated : i));
            setSprintIssues(prev => {
              const next = { ...prev };
              Object.keys(next).forEach(k => { next[k] = next[k].map(i => i.id === updated.id ? updated : i); });
              return next;
            });
          }} />
      )}
      {showCreate && board && (
        <CreateIssueModal boardId={board.id} onClose={() => setShowCreate(false)}
          onCreated={i => setBacklogIssues(p => [...p, i])} />
      )}
    </div>
  );
}
