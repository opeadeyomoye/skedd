import { useAuth } from '@clerk/nextjs'
import authenticatedFetch from '@/authenticatedFetch'

export default async function useFetch() {
  const { getToken } = useAuth()
  try {
    const token = await getToken()
    if (!token) {
      return fetch
    }

    return authenticatedFetch(token)
  }
  catch {
    return fetch
  }
}
