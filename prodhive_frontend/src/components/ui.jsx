export const STATUS_LABEL = s => s?.replace(/_/g, ' ') || ''

export const statusDot = s => ({
  TODO: 'bg-slate-400', IN_PROGRESS: 'bg-amber-400', IN_REVIEW: 'bg-purple-400',
  DONE: 'bg-emerald-400', BACKLOG: 'bg-slate-500', REOPENED: 'bg-red-400',
}[s] || 'bg-slate-400')

export const statusBadge = s => ({
  TODO: 'bg-slate-500/20 text-slate-300',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-300',
  IN_REVIEW: 'bg-purple-500/20 text-purple-300',
  DONE: 'bg-emerald-500/20 text-emerald-300',
  BACKLOG: 'bg-slate-500/20 text-slate-400',
  REOPENED: 'bg-red-500/20 text-red-300',
}[s] || 'bg-slate-500/20 text-slate-300')

export const priorityBadge = p => ({
  LOW: 'bg-blue-500/20 text-blue-300',
  MEDIUM: 'bg-amber-500/20 text-amber-300',
  HIGH: 'bg-orange-500/20 text-orange-300',
  CRITICAL: 'bg-red-500/20 text-red-300',
}[p] || 'bg-slate-500/20 text-slate-300')

export const typeBadge = t => ({
  BUG: 'bg-red-500/20 text-red-300',
  STORY: 'bg-emerald-500/20 text-emerald-300',
  TASK: 'bg-blue-500/20 text-blue-300',
  EPIC: 'bg-purple-500/20 text-purple-300',
}[t] || 'bg-blue-500/20 text-blue-300')

export const prBadge = s => ({
  OPEN: 'bg-blue-500/20 text-blue-300',
  MERGED: 'bg-purple-500/20 text-purple-300',
  CLOSED: 'bg-red-500/20 text-red-300',
}[s] || 'bg-slate-500/20 text-slate-300')

export const reviewBadge = s => ({
  APPROVED: 'bg-emerald-500/20 text-emerald-300',
  CHANGES_REQUESTED: 'bg-red-500/20 text-red-300',
  PENDING: 'bg-amber-500/20 text-amber-300',
}[s] || 'bg-slate-500/20 text-slate-300')

export const reviewerStatusBadge = s => ({
  REQUESTED: 'bg-amber-500/20 text-amber-300',
  APPROVED: 'bg-emerald-500/20 text-emerald-300',
  CHANGES_REQUESTED: 'bg-red-500/20 text-red-300',
  COMMENTED: 'bg-blue-500/20 text-blue-300',
}[s] || 'bg-slate-500/20 text-slate-300')

export function timeAgo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export const Badge = ({ cls, children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${cls}`}>
    {children}
  </span>
)

export function Spinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function Empty({ text = 'Nothing here yet.' }) {
  return <div className="flex items-center justify-center h-48 text-sm text-[var(--text-tertiary)]">{text}</div>
}
