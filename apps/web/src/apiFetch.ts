
const apiRoot = process.env.NEXT_PUBLIC_API_ROOT

export type BearerTokenType = undefined | string | (() => Promise<string | null>)

export default function apiFetch(bearerToken?: BearerTokenType, $fetchFn = fetch) {
  return {
    async fetch(input: RequestInfo | URL, init?: RequestInit) {
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
        if (typeof bearerToken === 'function') {
          bearerToken = String(await bearerToken())
        }
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
