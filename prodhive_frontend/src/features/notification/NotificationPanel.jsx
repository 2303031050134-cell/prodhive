import { useState, useEffect } from 'react';
import api from '@/shared/api/client';

export default function NotificationPanel({ onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/core/notifications').then(r => setNotifs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = async id => {
    await api.patch(`/core/notifications/${id}/read`);
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  const markAll = async () => {
    await api.patch('/core/notifications/read-all');
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="notif-panel">
      <div className="notif-panel-header">
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-heading)' }}>
          Notifications {unread > 0 && <span className="badge badge-inprogress" style={{ marginLeft: 6 }}>{unread}</span>}
        </span>
        {unread > 0 && <button className="btn btn-ghost btn-sm" onClick={markAll}>Mark all read</button>}
      </div>
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : notifs.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
      ) : (
        notifs.slice(0, 10).map(n => (
          <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markRead(n.id)}>
            <div className="notif-item-msg">{n.message}</div>
            <div className="notif-item-time">{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
}
