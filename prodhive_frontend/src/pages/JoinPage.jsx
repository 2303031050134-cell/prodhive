import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AUTH } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export const PENDING_JOIN_KEY = 'ph_pending_join_code'

/** Entry point for shareable invite links: /join/:code. Joins immediately if signed in, otherwise
 *  stashes the code and sends the person to sign in/register first. */
export default function JoinPage() {
  const { code } = useParams()
  const { user, applyOrgContext } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [status, setStatus] = useState('joining') // joining | error

  useEffect(() => {
    if (!user) {
      localStorage.setItem(PENDING_JOIN_KEY, code)
      navigate('/login')
      return
    }
    AUTH.post(`/organizations/join/${code}`)
      .then(({ data }) => {
        applyOrgContext(data.token, data.organization.name)
        toast(`Joined ${data.organization.name}!`)
        navigate('/app/projects')

      })
      .catch(err => {
        toast(err.response?.data?.message || 'Invalid or expired invite link', 'error')
        setStatus('error')
      })
  }, [])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-sm text-[var(--text-primary)] font-medium">That invite link didn't work.</p>
          <p className="text-xs text-[var(--text-tertiary)]">It may have been revoked or is invalid.</p>
          <Link to="/" className="text-xs text-[var(--accent-primary)] hover:underline">Go to your workspaces</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6">
      <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
        <div className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        Joining workspace…
      </div>
    </div>
  )
}
