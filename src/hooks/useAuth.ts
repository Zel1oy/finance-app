import { useAuthStore } from '../store/authSlice'
import { signOut } from '../lib/auth'

export function useAuth() {
  const { user, loading } = useAuthStore()
  return { user, loading, signOut }
}
