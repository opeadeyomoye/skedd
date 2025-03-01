
export default (token: string) => (
  (input: RequestInfo | URL, init?: RequestInit) => {
    init = init ?? {}
    init.headers = (init.headers ?? {}) as Record<string, string>
    init.headers.Authorization = `Bearer ${token}`

    return fetch(input, init)
  }
)
