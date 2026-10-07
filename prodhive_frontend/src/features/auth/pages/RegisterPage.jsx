import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/shared/api/client';
import { useAuth } from '@/features/auth/store/authStore';
import { useToast } from '@/shared/components/Toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'DEVELOPER' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/register', form);
      login({ fullName: data.fullName, email: data.email, role: data.role }, data.token);
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="sidebar-logo-icon">PH</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-heading)' }}>ProdHive</span>
        </div>
        <div className="auth-title">Create account</div>
        <div className="auth-sub">Start managing your projects</div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="input" placeholder="Jane Doe" value={form.fullName} onChange={set('fullName')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="input" value={form.role} onChange={set('role')}>
              <option value="DEVELOPER">Developer</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="QA">QA</option>
            </select>
          </div>
          <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
