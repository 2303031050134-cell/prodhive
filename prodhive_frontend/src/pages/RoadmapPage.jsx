import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Spinner, Empty } from '../components/ui'

const DOT_COLORS = ['bg-[var(--accent-primary)]', 'bg-purple-400', 'bg-amber-400', 'bg-emerald-400']

export default function RoadmapPage() {
  const { projectId } = useParams()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' })

  useEffect(() => {
    CORE.get(`/projects/${projectId}/roadmap`)
      .then(r => setItems(r.data))
      .catch(() => toast('Failed to load roadmap', 'error'))
      .finally(() => setLoading(false))
  }, [projectId])

  const create = async e => {
    e.preventDefault()
    try {
      const { data } = await CORE.post(`/projects/${projectId}/roadmap`, form)
      setItems(i => [...i, data].sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate)))
      setShowCreate(false); setForm({ title: '', description: '', targetDate: '' }); toast('Item added')
    } catch { toast('Failed', 'error') }
  }

  const remove = async id => {
    try {
      await CORE.delete(`/projects/${projectId}/roadmap/${id}`)
      setItems(i => i.filter(x => x.id !== id)); toast('Removed')
    } catch { toast('Failed', 'error') }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Roadmap</h1>
        <button className="plane-btn-primary text-xs" onClick={() => setShowCreate(true)}>+ Add Milestone</button>
      </div>

      {showCreate && (
        <div className="plane-card p-4">
          <form onSubmit={create} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1 flex-1 min-w-40">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Title</label>
              <input className="plane-input w-full text-xs" placeholder="Milestone title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="space-y-1 flex-1 min-w-40">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Description</label>
              <input className="plane-input w-full text-xs" placeholder="Optional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Target Date</label>
              <input className="plane-input text-xs" type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="plane-btn-primary text-xs">Add</button>
              <button type="button" className="plane-btn-secondary text-xs" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? <Empty text="No roadmap items yet." /> : (
        <div className="plane-card p-5">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-start gap-4 pb-6 last:pb-0 relative">
              {i < items.length - 1 && <div className="absolute left-[7px] top-5 bottom-0 w-px bg-[var(--border-subtle)]" />}
              <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 ${DOT_COLORS[i % DOT_COLORS.length]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                    {item.description && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-[var(--text-tertiary)]">{item.targetDate}</span>
                    <button onClick={() => remove(item.id)} className="text-[var(--text-tertiary)] hover:text-red-400 text-xs">✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
