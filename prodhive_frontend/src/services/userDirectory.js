import { AUTH } from './api'

// Simple in-memory cache so we don't refetch the same user names on every render/tab switch.
const cache = new Map()

/**
 * Resolve a list of numeric user ids to { id, fullName, email }, using the cache where possible.
 * Returns a Map<id, summary>. Never throws — falls back to a "User #id" placeholder on failure.
 */
export async function fetchUsers(ids) {
  const unique = [...new Set((ids || []).filter(id => id != null))]
  const missing = unique.filter(id => !cache.has(id))

  if (missing.length > 0) {
    try {
      const { data } = await AUTH.get(`/users/by-ids?ids=${missing.join(',')}`)
      data.forEach(u => cache.set(u.id, u))
    } catch {
      // leave missing ids uncached; callers fall back to placeholders
    }
  }

  const result = new Map()
  unique.forEach(id => {
    result.set(id, cache.get(id) || { id, fullName: `User #${id}`, email: '' })
  })
  return result
}

export async function searchUsers(query) {
  if (!query?.trim()) return []
  try {
    const { data } = await AUTH.get(`/users/search?q=${encodeURIComponent(query)}`)
    data.forEach(u => cache.set(u.id, u))
    return data
  } catch {
    return []
  }
}

export function initialsOf(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
