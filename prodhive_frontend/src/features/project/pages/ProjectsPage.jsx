import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/shared/api/client';
import { useToast } from '@/shared/components/Toast';
import { useAuth } from '@/features/auth/store/authStore';

function CreateProjectModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', key: '', description: '', organizationId: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/core/projects', { ...form, organizationId: Number(form.organizationId) });
      toast('Project created');
      onCreated(data);
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>New Project</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input className="input" placeholder="My Awesome Project" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Key (e.g. PROJ)</label>
              <input className="input" placeholder="PROJ" value={form.key} onChange={set('key')} required maxLength={6}
                style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="input" placeholder="What is this project about?" value={form.description} onChange={set('description')} />
            </div>
            <div className="form-group">
              <label className="form-label">Organization ID</label>
              <input className="input" type="number" placeholder="1" value={form.organizationId} onChange={set('organizationId')} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/core/projects').then(r => setProjects(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Projects</div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          <p>No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p.id} className="project-card" onClick={() => navigate(`/app/projects/${p.id}/board`)}>

              <div className="project-card-key">{p.key}</div>
              <div className="project-card-name">{p.name}</div>
              {p.description && <div className="project-card-desc">{p.description}</div>}
              <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                {p.archived && <span className="badge badge-todo">Archived</span>}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={p => setProjects(prev => [...prev, p])}
        />
      )}
    </div>
  );
}
