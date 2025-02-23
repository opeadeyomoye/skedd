import { SELF } from 'cloudflare:test'
import { describe, it, expect,  } from 'vitest'


const fetchPath = (p: string, init?: RequestInit) => SELF.fetch(`https://x.it${p}`, init)

describe('the worker', () => {

  it('rejects unsigned requests to /meta/hub', async () => {
    const response = await fetchPath('/meta/hub', { method: 'post' })
    expect(response.status).toBe(400)
    expect(await response.clone().text()).toBe('Missing signature')
  })

  it('rejects wrongly-signed requests to /meta/hub', async () => {
    expect(true).toBe(false)
  })

  it('prevents unknown whatsApp numbers from reaching the LLM', async () => {
    expect(true).toBe('')
  })

  it('lets verified numbers reach the LLM', async () => {
    expect(true).toBe(null)
  })
})
