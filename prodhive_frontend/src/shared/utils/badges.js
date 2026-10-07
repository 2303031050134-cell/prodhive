export const statusBadge = s => ({
  TODO: 'badge-todo',
  IN_PROGRESS: 'badge-inprogress',
  IN_REVIEW: 'badge-inreview',
  DONE: 'badge-done',
  BACKLOG: 'badge-backlog',
  REOPENED: 'badge-reopened',
}[s] || 'badge-todo');

export const priorityBadge = p => ({
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
  CRITICAL: 'badge-critical',
}[p] || 'badge-medium');

export const typeBadge = t => ({
  BUG: 'badge-bug',
  STORY: 'badge-story',
  TASK: 'badge-task',
  EPIC: 'badge-epic',
}[t] || 'badge-task');

export const statusLabel = s => s?.replace(/_/g, ' ') || '';
