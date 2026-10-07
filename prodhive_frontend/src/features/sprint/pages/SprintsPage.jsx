import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/shared/api/client';
import { useToast } from '@/shared/components/Toast';

export default function SprintsPage() {
  const { projectId } = useParams();
  const toast = useToast();
  const [board, setBoard] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  useEffect(() => {
    api.get(`/core/boards?projectId=${projectId}`).then(async r => {
      if (!r.data.length) { setLoading(false); return; }
      const b = r.data[0];
      setBoard(b);
      const res = await api.get(`/core/sprints?boardId=${b.id}`);
      setSprints(res.data);
    }).catch(() => toast('Failed to load sprints', 'error'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const createSprint = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/core/sprints', { ...form, boardId: board.id });
      setSprints(s => [...s, data]);
      setShowCreate(false);
      setForm({ name: '', startDate: '', endDate: '' });
      toast('Sprint created');
    } catch { toast('Failed to create sprint', 'error'); }
  };

  const action = async (id, action) => {
    try {
      const { data } = await api.patch(`/core/sprints/${id}/${action}`);
      setSprints(s => s.map(x => x.id === id ? data : x));
      toast(`Sprint ${action === 'start' ? 'started' : 'completed'}`);
    } catch { toast('Action failed', 'error'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!board) return <div className="empty-state"><p>No board found.</p></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Sprints</div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Sprint</button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={createSprint}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sprint Name</label>
                <input className="input" placeholder="Sprint 1" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Start Date</label>
                <input className="input" type="date" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">End Date</label>
                <input className="input" type="date" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {sprints.length === 0 ? (
        <div className="empty-state"><p>No sprints yet. Create your first sprint!</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sprints.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-heading)' }}>{s.name}</td>
                  <td>
                    <span className={`badge ${s.status === 'ACTIVE' ? 'badge-inprogress' : s.status === 'COMPLETED' ? 'badge-done' : 'badge-todo'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>{s.startDate || '—'}</td>
                  <td>{s.endDate || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {s.status === 'PLANNED' && (
                        <button className="btn btn-primary btn-sm" onClick={() => action(s.id, 'start')}>Start</button>
                      )}
                      {s.status === 'ACTIVE' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => action(s.id, 'complete')}>Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
