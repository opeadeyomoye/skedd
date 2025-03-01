import { useAuth } from '@clerk/nextjs'
import apiFetch from '@/apiFetch'

export default async function useApi() {
  const { getToken } = useAuth()
  try {
    const token = await getToken()
    return token ? apiFetch(token) : apiFetch()
  }
  catch {
    return apiFetch()
  }
}
