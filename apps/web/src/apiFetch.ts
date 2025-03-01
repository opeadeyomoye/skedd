
const apiRoot = process.env.NEXT_PUBLIC_API_ROOT

export default function (bearerToken?: string, $fetchFn = fetch) {
  return {
    fetch(input: RequestInfo | URL, init?: RequestInit) {
      if (
        typeof input === 'string' &&
        !input.startsWith('http://') &&
        !input.startsWith('https://')
      ) {
        input = `${apiRoot}${input}`
      }

      init = init ?? { headers: {} as Record<string, string> }
      init.headers = {
        ...init.headers,
        'Content-Type': `application/json`
      }
      if (bearerToken) {
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${bearerToken}`
        }
      }

      return $fetchFn(input, init)
    },

    get(input: RequestInfo | URL, init?: RequestInit) {
      return this.fetch(input, { method: 'get', ...init })
    },

    post(input: RequestInfo | URL, init?: RequestInit) {
      return this.fetch(input, { method: 'post', ...init })
    },
  }
}
