import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { AUTH } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PENDING_JOIN_KEY } from './JoinPage'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  if (user) return <Navigate to="/app" replace />


  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await AUTH.post('/login', form)
      login({ id: data.userId, fullName: data.fullName, email: data.email, role: data.role }, data.token)
      const pendingCode = localStorage.getItem(PENDING_JOIN_KEY)
      if (pendingCode) { localStorage.removeItem(PENDING_JOIN_KEY); navigate(`/join/${pendingCode}`) }
      else navigate('/app')

    } catch (err) {
      toast(err.response?.data?.message || 'Invalid credentials', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">P</div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Sign in to your ProdHive account</p>
        </div>
        <div className="plane-card p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Email</label>
              <input className="plane-input w-full" type="email" placeholder="you@company.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Password</label>
                <Link to="/forgot-password" className="text-[10px] text-[var(--accent-primary)] hover:underline">Forgot?</Link>
              </div>
              <input className="plane-input w-full" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading} className="plane-btn-primary w-full py-2 text-xs font-bold uppercase tracking-widest">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-5">
            No account? <Link to="/register" className="text-[var(--accent-primary)] hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
