import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CORE } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Spinner, STATUS_LABEL } from '../components/ui'
import { useRealtimeDashboard } from '../hooks/useRealtimeDashboard'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts'

const STATUS_COLOR = { TODO:'bg-slate-400', IN_PROGRESS:'bg-amber-400', IN_REVIEW:'bg-purple-400', DONE:'bg-emerald-400', BACKLOG:'bg-slate-500', REOPENED:'bg-red-400' }
const PRIORITY_COLOR = { LOW:'text-blue-400', MEDIUM:'text-amber-400', HIGH:'text-orange-400', CRITICAL:'text-red-400' }

const STATUS_HEX = { BACKLOG:'#64748b', TODO:'#94a3b8', IN_PROGRESS:'#f59e0b', IN_REVIEW:'#a855f7', DONE:'#10b981', REOPENED:'#ef4444' }
const PRIORITY_HEX = { LOW:'#60a5fa', MEDIUM:'#f59e0b', HIGH:'#fb923c', CRITICAL:'#ef4444' }
const TYPE_HEX = { TASK:'#60a5fa', BUG:'#ef4444', STORY:'#10b981', EPIC:'#a855f7' }

const tooltipStyle = { backgroundColor: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 11 }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myIssues, setMyIssues] = useState([])
  const [activity, setActivity] = useState([])
  const [attention, setAttention] = useState([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [liveEvents, setLiveEvents] = useState([])

  const refreshDashboard = () => Promise.all([
      CORE.get('/dashboard/my-issues'),
      CORE.get('/dashboard/recent-activity'),
      CORE.get('/dashboard/needs-attention'),
    ]).then(([i, a, n]) => { setMyIssues(i.data); setActivity(a.data); setAttention(n.data) })
      .catch(() => {})

  useEffect(() => {
    refreshDashboard().finally(() => setLoading(false))
  }, [])

  const projectIds = useMemo(() => activity.map(a => a.projectId).filter(Boolean), [activity])

  useRealtimeDashboard(projectIds, event => {
    setLive(true)
    setLiveEvents(current => [event, ...current.filter(e => e.id !== event.id)].slice(0, 12))
    setActivity(current => [event, ...current.filter(e => e.id !== event.id)].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 200))
    refreshDashboard()
  })

  const stats = [
    { label: 'Assigned to me', value: myIssues.length, color: 'text-[var(--text-primary)]' },
    { label: 'In Progress', value: myIssues.filter(i => i.status === 'IN_PROGRESS').length, color: 'text-amber-400' },
    { label: 'In Review', value: myIssues.filter(i => i.status === 'IN_REVIEW').length, color: 'text-purple-400' },
    { label: 'Done', value: myIssues.filter(i => i.status === 'DONE').length, color: 'text-emerald-400' },
  ]

  const statusData = useMemo(() => {
    const counts = {}
    myIssues.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1 })
    return Object.entries(counts).map(([status, value]) => ({ name: STATUS_LABEL(status), status, value }))
  }, [myIssues])

  const priorityData = useMemo(() => {
    const order = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    const counts = {}
    myIssues.forEach(i => { counts[i.priority] = (counts[i.priority] || 0) + 1 })
    return order.filter(p => counts[p]).map(p => ({ name: p, value: counts[p] }))
  }, [myIssues])

  const typeData = useMemo(() => {
    const counts = {}
    myIssues.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1 })
    return Object.entries(counts).map(([type, value]) => ({ name: type, value }))
  }, [myIssues])

  const activityTrend = useMemo(() => {
    const days = []
    const now = new Date()
    for (let n = 13; n >= 0; n--) {
      const d = new Date(now); d.setDate(d.getDate() - n)
      days.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count: 0 })
    }
    const map = Object.fromEntries(days.map(d => [d.key, d]))
    activity.forEach(a => {
      const key = new Date(a.createdAt).toISOString().slice(0, 10)
      if (map[key]) map[key].count += 1
    })
    return days
  }, [activity])

  const projectBreakdown = useMemo(() => {
    const counts = {}
    myIssues.forEach(i => {
      const p = i.board?.project
      if (!p) return
      const key = p.id
      if (!counts[key]) counts[key] = { id: p.id, name: p.name, key: p.key, total: 0, done: 0 }
      counts[key].total += 1
      if (i.status === 'DONE') counts[key].done += 1
    })
    return Object.values(counts).sort((a, b) => b.total - a.total)
  }, [myIssues])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Good day, {user?.fullName?.split(' ')[0]} 👋</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-[var(--text-tertiary)]">Here's what's on your plate today.</p>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${live ? 'text-emerald-400' : 'text-[var(--text-tertiary)]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {live ? 'Live' : 'Waiting for live events'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="plane-card p-4">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {attention.length > 0 && (
        <div className="plane-card p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Needs your attention</h2>
          <div className="space-y-2">
            {attention.map((item, idx) => (
              <button key={idx} onClick={() => navigate(`/app/projects/${item.projectId}/pull-requests`)}
                className="w-full flex items-center gap-3 rounded-lg bg-[var(--bg-surface-2)] px-3 py-2.5 text-left hover:bg-[var(--bg-surface-3)] transition-colors">
                <span className="text-base flex-shrink-0">
                  {item.type === 'REVIEW_REQUESTED' ? '🔴' : item.type === 'CHANGES_REQUESTED' ? '🟡' : '🔵'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                    {item.issueKey ? `${item.issueKey} · ` : ''}{item.prTitle || item.issueTitle}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{item.message}</div>
                </div>
                <span className="text-[10px] text-[var(--accent-primary)] flex-shrink-0">
                  {item.type === 'REVIEW_REQUESTED' ? 'Review PR →' : item.type === 'CHANGES_REQUESTED' ? 'View changes →' : 'Assign reviewer →'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {liveEvents.length > 0 && (
        <div className="plane-card p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Live development feed</h2>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Updates from your connected projects appear here automatically.</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {liveEvents.slice(0, 6).map(event => (
              <div key={event.id} className="flex items-start gap-2 rounded-lg bg-[var(--bg-surface-2)] px-3 py-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-primary)] truncate">{event.detail || event.action}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{event.action} · {new Date(event.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status distribution donut */}
        <div className="plane-card p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Issues by Status</h2>
          {statusData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {statusData.map(d => <Cell key={d.status} fill={STATUS_HEX[d.status] || '#94a3b8'} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority breakdown */}
        <div className="plane-card p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Issues by Priority</h2>
          {priorityData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map(d => <Cell key={d.name} fill={PRIORITY_HEX[d.name] || '#94a3b8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Type breakdown */}
        <div className="plane-card p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Issues by Type</h2>
          {typeData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {typeData.map(d => <Cell key={d.name} fill={TYPE_HEX[d.name] || '#94a3b8'} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity trend */}
      <div className="plane-card p-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Activity — Last 14 Days</h2>
        {activity.length === 0 ? <EmptyChart text="No activity yet." /> : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activityTrend}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3f76ff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3f76ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#3f76ff" strokeWidth={2} fill="url(#activityFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Issues */}
        <div className="plane-card p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">My Issues</h2>
          {myIssues.length === 0
            ? <p className="text-xs text-[var(--text-tertiary)]">No issues assigned to you.</p>
            : myIssues.slice(0, 8).map(issue => (
              <div key={issue.id} onClick={() => navigate(`/app/projects/${issue.board?.project?.id || ''}/board`)}
                className="flex items-center gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0 cursor-pointer hover:bg-[var(--bg-surface-2)] -mx-2 px-2 rounded transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_COLOR[issue.status] || 'bg-slate-400'}`} />
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono w-16 flex-shrink-0">{issue.issueKey}</span>
                <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{issue.title}</span>
                <span className={`text-[10px] font-bold ${PRIORITY_COLOR[issue.priority] || ''}`}>{issue.priority}</span>
              </div>
            ))
          }
        </div>

        {/* Recent Activity */}
        <div className="plane-card p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent Activity</h2>
          {activity.length === 0
            ? <p className="text-xs text-[var(--text-tertiary)]">No recent activity.</p>
            : activity.slice(0, 8).map(a => (
              <div key={a.id} className="py-2 border-b border-[var(--border-subtle)] last:border-0">
                <p className="text-xs text-[var(--text-primary)]">{a.detail || a.action}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Projects overview */}
      <div className="plane-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">My Projects</h2>
          <button onClick={() => navigate('/app/projects')} className="text-[10px] text-[var(--accent-primary)] hover:underline font-bold uppercase tracking-wide">View all</button>

        </div>
        {projectBreakdown.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)]">You have no issues assigned across any project yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {projectBreakdown.map(p => {
              const pct = p.total ? Math.round((p.done / p.total) * 100) : 0
              return (
                <div key={p.id} onClick={() => navigate(`/app/projects/${p.id}/board`)}
                  className="border border-[var(--border-subtle)] rounded-lg p-3 cursor-pointer hover:border-[var(--accent-primary)] transition-colors">

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">{p.key}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">{p.done}/{p.total} done</span>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-primary)] mb-2 truncate">{p.name}</p>
                  <div className="h-1.5 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyChart({ text = 'No data yet.' }) {
  return <div className="flex items-center justify-center h-[200px] text-xs text-[var(--text-tertiary)]">{text}</div>
}
