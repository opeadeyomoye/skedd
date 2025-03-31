import { useAuth } from '@clerk/nextjs'
import { use } from 'react'
import apiFetch from '@/apiFetch'

export default function useApi() {
  const { getToken } = useAuth()
  try {
    const token = use(getToken())
    return token ? apiFetch(token) : apiFetch()
  }
  catch {
    return apiFetch()
  }
}
