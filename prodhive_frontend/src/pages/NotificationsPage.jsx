import { useState, useEffect } from 'react'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Spinner, Empty } from '../components/ui'

export default function NotificationsPage() {
  const toast = useToast()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    CORE.get('/notifications').then(r => setNotifs(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const markRead = async id => {
    try {
      await CORE.patch(`/notifications/${id}/read`)
      setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x))
    } catch { toast('Failed', 'error') }
  }

  const markAll = async () => {
    try {
      await CORE.patch('/notifications/read-all')
      setNotifs(n => n.map(x => ({ ...x, read: true }))); toast('All marked as read')
    } catch { toast('Failed', 'error') }
  }

  const unread = notifs.filter(n => !n.read).length

  if (loading) return <Spinner />

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Notifications</h1>
          {unread > 0 && (
            <span className="bg-[var(--accent-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="plane-btn-secondary text-xs">Mark all read</button>
        )}
      </div>

      {notifs.length === 0 ? <Empty text="No notifications." /> : (
        <div className="plane-card overflow-hidden p-0">
          {notifs.map(n => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)}
              className={`flex items-start gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] last:border-0 transition-colors ${!n.read ? 'cursor-pointer hover:bg-[var(--bg-surface-2)] border-l-2 border-l-[var(--accent-primary)]' : 'opacity-60'}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!n.read ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-subtle)]'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-[var(--text-tertiary)]">{new Date(n.createdAt).toLocaleString()}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface-2)] px-1.5 py-0.5 rounded">{n.type?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              {!n.read && <span className="text-[10px] text-[var(--accent-primary)] font-bold flex-shrink-0">NEW</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
