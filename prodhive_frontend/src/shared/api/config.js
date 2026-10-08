const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const apiUrl = configuredApiUrl ? configuredApiUrl.replace(/\/+$/, '') : ''

export const AUTH_API_URL = `${apiUrl}/api`
export const CORE_API_URL = `${apiUrl}/api/core`
