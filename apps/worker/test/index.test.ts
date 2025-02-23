import { env, SELF } from 'cloudflare:test'
import { faker } from '@faker-js/faker'
import { describe, it, expect,  } from 'vitest'


const fetchPath = (p: string, init?: RequestInit) => SELF.fetch(`https://x.it${p}`, init)

const signRequestBody = async (key: string, body: Record<string, unknown>) => {
  const encoder = new TextEncoder()
  const encodedBody = encoder.encode(JSON.stringify(body))
  const algorithm = { name: 'HMAC', hash: 'SHA-256' }

  const signatureKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    algorithm,
    false,
    ['sign']
  )
  const buffer = await crypto.subtle.sign(algorithm, signatureKey, encodedBody)

  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
}


describe('the worker', () => {
  it('rejects unsigned requests to /meta/hub', async () => {
    const response = await fetchPath('/meta/hub', { method: 'post' })

    expect(response.status).toBe(400)
    expect(await response.clone().text()).toBe('Missing signature')
  })

  it('rejects wrongly-signed requests to /meta/hub', async () => {
    const key = faker.string.hexadecimal({
      length: faker.number.int({ min: 16, max: 4096 })
    }).slice(2).toLowerCase()

    const body = { name: 'test' }
    const signature = await signRequestBody(key, body)
    const response = await fetchPath('/meta/hub', {
      method: 'post',
      headers: {
        'X-HUB-SIGNATURE-256': `sha256=${signature}`
      },
      body: JSON.stringify(body)
    })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Invalid signature')
  })

  it.todo('prevents unknown whatsApp numbers from reaching the LLM', async () => {
    expect(true).toBe('')
  })

  it.todo('lets verified numbers reach the LLM', async () => {
    expect(true).toBe(null)
  })
})
