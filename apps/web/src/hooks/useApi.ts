import { useAuth } from '@clerk/nextjs'
import apiFetch, { type BearerTokenType } from '@/apiFetch'

export default function useApi(token?: BearerTokenType) {
  const { getToken } = useAuth()
  if (token) {
    return apiFetch(token)
  }

  return apiFetch(getToken)
}
