import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { AUTH } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PENDING_JOIN_KEY } from './JoinPage'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'DEVELOPER' })
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  if (user) return <Navigate to="/app" replace />

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await AUTH.post('/register', form)
      login({ id: data.userId, fullName: data.fullName, email: data.email, role: data.role }, data.token)
      const pendingCode = localStorage.getItem(PENDING_JOIN_KEY)
      if (pendingCode) { localStorage.removeItem(PENDING_JOIN_KEY); navigate(`/join/${pendingCode}`) }
      else navigate('/app')

    } catch (err) {
      toast(err.response?.data?.message || 'Registration failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">P</div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Create account</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Start managing your projects</p>
        </div>
        <div className="plane-card p-6">
          <form onSubmit={submit} className="space-y-4">
            {[['fullName','Full Name','text','Jane Doe'],['email','Email','email','you@company.com'],['password','Password','password','••••••••']].map(([k,l,t,p]) => (
              <div key={k} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{l}</label>
                <input className="plane-input w-full" type={t} placeholder={p} value={form[k]} onChange={set(k)} required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="plane-btn-primary w-full py-2 text-xs font-bold uppercase tracking-widest">
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-3">
            You'll start as a workspace member — create or join an organization next to get going.
          </p>
          <p className="text-center text-[10px] text-[var(--text-tertiary)] mt-5">
            Already have an account? <Link to="/login" className="text-[var(--accent-primary)] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
