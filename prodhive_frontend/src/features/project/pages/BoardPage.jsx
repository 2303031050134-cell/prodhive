import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/shared/api/client';
import { statusBadge, priorityBadge, typeBadge, statusLabel } from '@/shared/utils/badges';
import IssueModal from '@/features/issue/components/IssueModal';
import CreateIssueModal from '@/features/issue/components/CreateIssueModal';
import { useToast } from '@/shared/components/Toast';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const COL_COLORS = {
  TODO: 'var(--text-muted)',
  IN_PROGRESS: 'var(--info)',
  IN_REVIEW: 'var(--purple)',
  DONE: 'var(--accent)',
};

export default function BoardPage() {
  const { projectId } = useParams();
  const toast = useToast();
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createStatus, setCreateStatus] = useState('TODO');

  useEffect(() => {
    api.get(`/core/boards?projectId=${projectId}`)
      .then(r => {
        setBoards(r.data);
        if (r.data.length > 0) setSelectedBoard(r.data[0]);
      }).catch(() => toast('Failed to load boards', 'error'))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (!selectedBoard) return;
    api.get(`/core/sprints?boardId=${selectedBoard.id}`).then(r => {
      setSprints(r.data);
      const active = r.data.find(s => s.status === 'ACTIVE');
      if (active) setSelectedSprint(active.id);
    }).catch(() => {});
  }, [selectedBoard]);

  useEffect(() => {
    if (!selectedBoard) return;
    const params = new URLSearchParams({ boardId: selectedBoard.id });
    if (selectedSprint) params.set('sprintId', selectedSprint);
    api.get(`/core/issues?${params}`).then(r => setIssues(r.data)).catch(() => {});
  }, [selectedBoard, selectedSprint]);

  const issuesByStatus = col => issues.filter(i => i.status === col).sort((a, b) => a.rank - b.rank);

  const handleIssueUpdated = updated => {
    setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleIssueCreated = issue => {
    setIssues(prev => [...prev, issue]);
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  if (boards.length === 0) return (
    <div className="empty-state">
      <p>No boards found for this project.</p>
      <CreateBoardButton projectId={projectId} onCreated={b => { setBoards([b]); setSelectedBoard(b); }} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="page-title">Board</div>
          <select className="input" style={{ width: 'auto', fontSize: 12 }}
            value={selectedBoard?.id || ''} onChange={e => setSelectedBoard(boards.find(b => b.id == e.target.value))}>
            {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {sprints.length > 0 && (
            <select className="input" style={{ width: 'auto', fontSize: 12 }}
              value={selectedSprint} onChange={e => setSelectedSprint(e.target.value)}>
              <option value="">All Issues</option>
              {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
            </select>
          )}
        </div>
        <button className="btn btn-primary" onClick={() => { setCreateStatus('TODO'); setShowCreate(true); }}>
          + Create Issue
        </button>
      </div>

      <div className="kanban-board">
        {COLUMNS.map(col => (
          <div key={col} className="kanban-col">
            <div className="kanban-col-header">
              <span className="kanban-col-title" style={{ color: COL_COLORS[col] }}>{statusLabel(col)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="kanban-col-count">{issuesByStatus(col).length}</span>
                <button className="btn-icon" style={{ fontSize: 16, padding: '2px 4px' }}
                  onClick={() => { setCreateStatus(col); setShowCreate(true); }}>+</button>
              </div>
            </div>
            <div className="kanban-col-body">
              {issuesByStatus(col).map(issue => (
                <div key={issue.id} className="issue-card" onClick={() => setSelectedIssueId(issue.id)}>
                  <div className="issue-card-key">{issue.issueKey}</div>
                  <div className="issue-card-title">{issue.title}</div>
                  <div className="issue-card-footer">
                    <span className={`badge ${typeBadge(issue.type)}`}>{issue.type}</span>
                    <span className={`badge ${priorityBadge(issue.priority)}`}>{issue.priority}</span>
                  </div>
                  {issue.assigneeId && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>U</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{issue.assigneeId}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedIssueId && (
        <IssueModal issueId={selectedIssueId} onClose={() => setSelectedIssueId(null)} onUpdated={handleIssueUpdated} />
      )}
      {showCreate && selectedBoard && (
        <CreateIssueModal
          boardId={selectedBoard.id}
          sprintId={selectedSprint || null}
          defaultStatus={createStatus}
          onClose={() => setShowCreate(false)}
          onCreated={handleIssueCreated}
        />
      )}
    </div>
  );
}

function CreateBoardButton({ projectId, onCreated }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const create = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/core/boards', { name: 'Main Board', projectId: Number(projectId) });
      onCreated(data);
      toast('Board created');
    } catch { toast('Failed to create board', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <button className="btn btn-primary" onClick={create} disabled={loading}>
      {loading ? <span className="spinner" /> : 'Create Board'}
    </button>
  );
}
