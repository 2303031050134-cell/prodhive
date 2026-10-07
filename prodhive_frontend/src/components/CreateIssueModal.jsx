import { useState, useEffect } from 'react'
import { CORE } from '../services/api'
import { useToast } from '../context/ToastContext'
import { fetchUsers } from '../services/userDirectory'

export default function CreateIssueModal({ boardId, sprintId, projectId, defaultStatus = 'TODO', onClose, onCreated }) {
  const toast = useToast()
  const [form, setForm] = useState({ title: '', description: '', type: 'TASK', priority: 'MEDIUM', status: defaultStatus, boardId, sprintId: sprintId || null, assigneeId: null })
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState([])
  const [names, setNames] = useState(new Map())
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!projectId) return
    CORE.get(`/projects/${projectId}/members`)
      .then(async r => { setMembers(r.data); setNames(await fetchUsers(r.data.map(m => m.userId))) })
      .catch(() => {})
  }, [projectId])

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await CORE.post('/issues', { ...form, assigneeId: form.assigneeId ? Number(form.assigneeId) : null })
      toast('Issue created')
      onCreated(data)
      onClose()
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <span className="font-semibold text-[var(--text-primary)]">Create Issue</span>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Title</label>
            <input className="plane-input w-full" placeholder="Issue title" value={form.title} onChange={set('title')} required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Description</label>
            <textarea className="plane-input w-full resize-none h-20" placeholder="Describe the issue…" value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['type','Type',['TASK','BUG','STORY','EPIC']],['priority','Priority',['LOW','MEDIUM','HIGH','CRITICAL']],['status','Status',['BACKLOG','TODO','IN_PROGRESS','IN_REVIEW','DONE']]].map(([k,l,opts]) => (
              <div key={k} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{l}</label>
                <select className="plane-input w-full text-xs" value={form[k]} onChange={set(k)}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          {members.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Assignee</label>
              <select className="plane-input w-full text-xs" value={form.assigneeId || ''} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value || null }))}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{names.get(m.userId)?.fullName || `User #${m.userId}`}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="plane-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className="plane-btn-primary">{loading ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
