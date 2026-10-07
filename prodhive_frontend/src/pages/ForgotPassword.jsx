import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AUTH } from '../services/api'
import { useToast } from '../context/ToastContext'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await AUTH.post('/forgot-password', { email })
      setSent(true)
      toast('Reset link sent — check your email')
    } catch { toast('Failed to send reset email', 'error') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="Reset password" sub="Enter your email to receive a reset link">
      {sent ? (
        <div className="text-center py-4">
          <p className="text-sm text-emerald-400 font-medium">Check your inbox for the reset link.</p>
          <Link to="/login" className="text-[10px] text-[var(--accent-primary)] hover:underline mt-3 block">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Email</label>
            <input className="plane-input w-full" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="plane-btn-primary w-full py-2 text-xs font-bold uppercase tracking-widest">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
          <p className="text-center text-[10px] text-[var(--text-tertiary)]">
            <Link to="/login" className="text-[var(--accent-primary)] hover:underline">Back to login</Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}

export function ResetPassword() {
  const [form, setForm] = useState({ token: new URLSearchParams(window.location.search).get('token') || '', newPassword: '' })
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await AUTH.post('/reset-password', form)
      setDone(true)
      toast('Password reset successfully')
    } catch { toast('Reset failed — link may be expired', 'error') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="New password" sub="Enter your new password below">
      {done ? (
        <div className="text-center py-4">
          <p className="text-sm text-emerald-400 font-medium">Password updated!</p>
          <Link to="/login" className="text-[10px] text-[var(--accent-primary)] hover:underline mt-3 block">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">New Password</label>
            <input className="plane-input w-full" type="password" placeholder="••••••••"
              value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required />
          </div>
          <button type="submit" disabled={loading} className="plane-btn-primary w-full py-2 text-xs font-bold uppercase tracking-widest">
            {loading ? 'Saving…' : 'Set New Password'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}

export function VerifyEmail() {
  const token = new URLSearchParams(window.location.search).get('token')
  const [status, setStatus] = useState('pending')

  useState(() => {
    if (!token) { setStatus('error'); return }
    AUTH.get(`/verify?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <AuthShell title="Email verification" sub="">
      <div className="text-center py-6">
        {status === 'pending' && <p className="text-sm text-[var(--text-secondary)]">Verifying…</p>}
        {status === 'success' && <p className="text-sm text-emerald-400 font-medium">Email verified! <Link to="/login" className="text-[var(--accent-primary)] hover:underline">Sign in</Link></p>}
        {status === 'error' && <p className="text-sm text-red-400">Verification failed — link may be invalid or expired.</p>}
      </div>
    </AuthShell>
  )
}

function AuthShell({ title, sub, children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">P</div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
          {sub && <p className="text-xs text-[var(--text-tertiary)] mt-1">{sub}</p>}
        </div>
        <div className="plane-card p-6">{children}</div>
      </div>
    </div>
  )
}

export default ForgotPassword
