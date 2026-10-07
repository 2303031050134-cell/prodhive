import axios from 'axios'

const AUTH = axios.create({ baseURL: '/api' })
const CORE = axios.create({ baseURL: '/api/core' })

const parseJwt = token => {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return {} }
}

const inject = cfg => {
  const t = localStorage.getItem('ph_token')
  if (t) {
    const claims = parseJwt(t)
    cfg.headers.Authorization = `Bearer ${t}`
    if (claims.userId) cfg.headers['X-User-Id'] = claims.userId
    if (claims.role)   cfg.headers['X-User-Role'] = claims.role
    if (claims.orgId)  cfg.headers['X-Org-Id'] = claims.orgId
    if (claims.orgRole) cfg.headers['X-Org-Role'] = claims.orgRole
  }
  return cfg
}
AUTH.interceptors.request.use(inject)
CORE.interceptors.request.use(inject)

const handle401 = err => {
  if (err.response?.status === 401) {
    localStorage.clear()
    window.location.href = '/login'
  }
  return Promise.reject(err)
}
AUTH.interceptors.response.use(r => r, handle401)
CORE.interceptors.response.use(r => r, handle401)

export { AUTH, CORE }
