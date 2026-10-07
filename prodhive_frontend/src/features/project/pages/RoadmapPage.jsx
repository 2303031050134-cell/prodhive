import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/shared/api/client';
import { useToast } from '@/shared/components/Toast';

export default function RoadmapPage() {
  const { projectId } = useParams();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' });

  useEffect(() => {
    api.get(`/core/projects/${projectId}/roadmap`)
      .then(r => setItems(r.data))
      .catch(() => toast('Failed to load roadmap', 'error'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const create = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/core/projects/${projectId}/roadmap`, form);
      setItems(i => [...i, data].sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate)));
      setShowCreate(false);
      setForm({ title: '', description: '', targetDate: '' });
      toast('Roadmap item added');
    } catch { toast('Failed to add item', 'error'); }
  };

  const remove = async id => {
    try {
      await api.delete(`/core/projects/${projectId}/roadmap/${id}`);
      setItems(i => i.filter(x => x.id !== id));
      toast('Item removed');
    } catch { toast('Failed to remove item', 'error'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Roadmap</div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Item</button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={create}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Title</label>
                <input className="input" placeholder="Milestone title" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <input className="input" placeholder="Optional description" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Date</label>
                <input className="input" type="date" value={form.targetDate}
                  onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">Add</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M3 6h18M3 18h12"/></svg>
          <p>No roadmap items yet</p>
        </div>
      ) : (
        <div className="card">
          {items.map((item, i) => (
            <div key={item.id} className="roadmap-item">
              <div className="roadmap-date">{item.targetDate}</div>
              <div className="roadmap-dot" style={{ background: i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? 'var(--info)' : 'var(--purple)' }} />
              <div className="roadmap-content">
                <div className="roadmap-title">{item.title}</div>
                {item.description && <div className="roadmap-desc">{item.description}</div>}
              </div>
              <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => remove(item.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
