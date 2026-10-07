import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Badge, Spinner, Empty } from '../components/ui'

export default function SprintsPage() {
  const { projectId } = useParams()
  const toast = useToast()
  const [board, setBoard] = useState(null)
  const [sprints, setSprints] = useState([])
  const [capacities, setCapacities] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })
  const [capEdit, setCapEdit] = useState({})

  useEffect(() => {
    CORE.get(`/boards?projectId=${projectId}`).then(async r => {
      if (!r.data.length) { setLoading(false); return }
      const b = r.data[0]; setBoard(b)
      const sp = await CORE.get(`/sprints?boardId=${b.id}`)
      setSprints(sp.data)
      const caps = {}
      await Promise.all(sp.data.map(async s => {
        try { const c = await CORE.get(`/sprints/${s.id}/capacity`); caps[s.id] = c.data } catch {}
      }))
      setCapacities(caps)
    }).catch(() => toast('Failed', 'error')).finally(() => setLoading(false))
  }, [projectId])

  const create = async e => {
    e.preventDefault()
    try {
      const { data } = await CORE.post('/sprints', { ...form, boardId: board.id })
      setSprints(s => [...s, data]); setShowCreate(false); setForm({ name: '', startDate: '', endDate: '' }); toast('Sprint created')
    } catch { toast('Failed', 'error') }
  }

  const action = async (id, act) => {
    try {
      const { data } = await CORE.patch(`/sprints/${id}/${act}`)
      setSprints(s => s.map(x => x.id === id ? data : x)); toast(`Sprint ${act === 'start' ? 'started' : 'completed'}`)
    } catch { toast('Failed', 'error') }
  }

  const setCapacity = async (id, cap) => {
    try {
      await CORE.put(`/sprints/${id}/capacity`, { capacity: Number(cap) })
      const c = await CORE.get(`/sprints/${id}/capacity`)
      setCapacities(prev => ({ ...prev, [id]: c.data })); toast('Capacity updated')
    } catch { toast('Failed', 'error') }
    setCapEdit(e => ({ ...e, [id]: false }))
  }

  if (loading) return <Spinner />
  if (!board) return <Empty text="No board found." />

  const statusBadgeCls = s => s === 'ACTIVE' ? 'bg-amber-500/20 text-amber-300' : s === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Sprints</h1>
        <button className="plane-btn-primary text-xs" onClick={() => setShowCreate(true)}>+ New Sprint</button>
      </div>

      {showCreate && (
        <div className="plane-card p-4">
          <form onSubmit={create} className="flex flex-wrap gap-3 items-end">
            {[['name','Sprint Name','text','Sprint 1'],['startDate','Start Date','date',''],['endDate','End Date','date','']].map(([k,l,t,p]) => (
              <div key={k} className="space-y-1 flex-1 min-w-32">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{l}</label>
                <input className="plane-input w-full text-xs" type={t} placeholder={p} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required={k === 'name'} />
              </div>
            ))}
            <div className="flex gap-2">
              <button type="submit" className="plane-btn-primary text-xs">Create</button>
              <button type="button" className="plane-btn-secondary text-xs" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {sprints.length === 0 ? <Empty text="No sprints yet." /> : (
        <div className="space-y-3">
          {sprints.map(s => {
            const cap = capacities[s.id]
            return (
              <div key={s.id} className="plane-card p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{s.name}</span>
                  <Badge cls={statusBadgeCls(s.status)}>{s.status}</Badge>
                  {s.startDate && <span className="text-xs text-[var(--text-tertiary)]">{s.startDate} → {s.endDate}</span>}

                  {/* Capacity */}
                  {cap && (
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-24 h-1.5 bg-[var(--bg-surface-2)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-primary)] rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((cap.assigned || 0) / (cap.capacity || 1)) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)]">{cap.assigned || 0}/{cap.capacity || 0} pts</span>
                    </div>
                  )}

                  <div className="ml-auto flex gap-2 items-center">
                    {capEdit[s.id] ? (
                      <CapacityInput sprintId={s.id} onSave={setCapacity} onCancel={() => setCapEdit(e => ({ ...e, [s.id]: false }))} />
                    ) : (
                      <button className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" onClick={() => setCapEdit(e => ({ ...e, [s.id]: true }))}>Set Capacity</button>
                    )}
                    {s.status === 'PLANNED'   && <button className="plane-btn-primary text-xs py-1"   onClick={() => action(s.id, 'start')}>Start</button>}
                    {s.status === 'ACTIVE'    && <button className="plane-btn-secondary text-xs py-1" onClick={() => action(s.id, 'complete')}>Complete</button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CapacityInput({ sprintId, onSave, onCancel }) {
  const [val, setVal] = useState('')
  return (
    <div className="flex items-center gap-1">
      <input className="plane-input text-xs py-0.5 w-16" type="number" placeholder="pts" value={val} onChange={e => setVal(e.target.value)} />
      <button className="text-[10px] text-[var(--accent-primary)] font-bold" onClick={() => onSave(sprintId, val)}>Save</button>
      <button className="text-[10px] text-[var(--text-tertiary)]" onClick={onCancel}>✕</button>
    </div>
  )
}
