import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)

const parseJwt = token => {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return {} }
}

function buildUser(base, token) {
  const claims = parseJwt(token)
  return {
    ...base,
    id: claims.userId ?? base.id,
    orgId: claims.orgId ?? null,
    orgRole: claims.orgRole ?? null, // this user's role WITHIN the active org (OWNER/ADMIN/MEMBER)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ph_user')) } catch { return null }
  })

  const login = (userData, token) => {
    const full = buildUser(userData, token)
    localStorage.setItem('ph_token', token)
    localStorage.setItem('ph_user', JSON.stringify(full))
    setUser(full)
  }

  // Used after creating/switching/joining an organization: swaps the active-org context
  // in place (fresh token from the server) without forcing a full re-login.
  const applyOrgContext = (token, orgName) => {
    setUser(prev => {
      const next = buildUser({ ...prev, orgName }, token)
      localStorage.setItem('ph_token', token)
      localStorage.setItem('ph_user', JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return <Ctx.Provider value={{ user, login, logout, applyOrgContext }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
