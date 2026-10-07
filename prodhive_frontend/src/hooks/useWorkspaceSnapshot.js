import { useAuth } from '../context/AuthContext'

export function useRequireAuth() {
  const { user } = useAuth()
  return user
}
