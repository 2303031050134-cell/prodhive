import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

export default function AnalyticsPage() {
  const { projectId } = useParams()
  const toast = useToast()
  const [board, setBoard] = useState(null)
  const [sprints, setSprints] = useState([])
  const [sprintId, setSprintId] = useState('')
  const [burndown, setBurndown] = useState([])
  const [velocity, setVelocity] = useState([])
  const [cycleTime, setCycleTime] = useState(null)
  const [leadTime, setLeadTime] = useState(null)
  const [workload, setWorkload] = useState({})
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    CORE.get(`/boards?projectId=${projectId}`).then(async r => {
      if (!r.data.length) { setLoading(false); return }
      const b = r.data[0]; setBoard(b)
      const [sp, vel, ct, lt, wl, h] = await Promise.all([
        CORE.get(`/sprints?boardId=${b.id}`),
        CORE.get(`/boards/${b.id}/analytics/velocity`),
        CORE.get(`/boards/${b.id}/analytics/cycle-time`),
        CORE.get(`/boards/${b.id}/analytics/lead-time`),
        CORE.get(`/boards/${b.id}/workload/by-assignee`),
        CORE.get(`/boards/${b.id}/workload/health`),
      ])
      setSprints(sp.data); setVelocity(vel.data)
      setCycleTime(ct.data.avgHours); setLeadTime(lt.data.avgHours)
      setWorkload(wl.data); setHealth(h.data.score)
      const active = sp.data.find(s => s.status === 'ACTIVE')
      if (active) setSprintId(active.id)
    }).catch(() => toast('Failed to load analytics', 'error')).finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    if (!board || !sprintId) return
    CORE.get(`/boards/${board.id}/analytics/burndown?sprintId=${sprintId}`)
      .then(r => setBurndown(r.data)).catch(() => {})
  }, [board, sprintId])

  if (loading) return <Spinner />
  if (!board) return <div className="flex items-center justify-center h-48 text-sm text-[var(--text-tertiary)]">No board found.</div>

  const maxWl = Math.max(...Object.values(workload), 1)

  const tooltipStyle = { backgroundColor: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 11 }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[var(--text-primary)]">Analytics</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Health Score', value: health ?? '—', color: 'text-emerald-400' },
          { label: 'Avg Cycle Time', value: cycleTime != null ? `${cycleTime.toFixed(1)}h` : '—', color: 'text-[var(--accent-primary)]' },
          { label: 'Avg Lead Time', value: leadTime != null ? `${leadTime.toFixed(1)}h` : '—', color: 'text-purple-400' },
          { label: 'Active Assignees', value: Object.keys(workload).length, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="plane-card p-4">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Burndown */}
        <div className="plane-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Burndown Chart</h2>
            <select className="plane-input text-xs py-1" value={sprintId} onChange={e => setSprintId(e.target.value)}>
              <option value="">Select Sprint</option>
              {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {burndown.length === 0
            ? <p className="text-xs text-[var(--text-tertiary)]">No burndown data.</p>
            : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={burndown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="remaining" stroke="#3f76ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Velocity */}
        <div className="plane-card p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Velocity (Last 5 Sprints)</h2>
          {velocity.length === 0
            ? <p className="text-xs text-[var(--text-tertiary)]">No velocity data.</p>
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={velocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="sprintName" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="completed" fill="#3f76ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Workload */}
      <div className="plane-card p-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Workload by Assignee</h2>
        {Object.keys(workload).length === 0
          ? <p className="text-xs text-[var(--text-tertiary)]">No workload data.</p>
          : (
            <div className="space-y-3">
              {Object.entries(workload).map(([uid, count]) => (
                <div key={uid} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                    {uid.slice(-2)}
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] w-20 flex-shrink-0">User #{uid}</span>
                  <div className="flex-1 h-2 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
                      style={{ width: `${(count / maxWl) * 100}%` }} />
                  </div>
                  <span className="text-xs text-[var(--text-primary)] w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
