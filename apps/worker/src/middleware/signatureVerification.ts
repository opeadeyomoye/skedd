import { createMiddleware } from 'hono/factory'
import { Buffer } from 'node:buffer'

export default createMiddleware(async (ctx, next) => {
  /**
   * get raw body
   * sha256 with app secret
   * continue or return 400
   */

  const signature = ctx.req.header('x-hub-signature-256')?.slice(7)
  if (!signature?.length) {
    return ctx.text('Missing signature', 400)
  }

  const encoder = new TextEncoder()
  const algorithm = { name: 'HMAC', hash: 'SHA-256' }
  const body = await ctx.req.raw.clone().text()
  const secret = await ctx.env.META_APP_SECRET
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    algorithm,
    false,
    ['verify']
  )

  const received = Buffer.from(signature, 'hex')
  const verified = await crypto.subtle.verify(
    algorithm,
    secretKey,
    received,
    encoder.encode(body)
  )

  if (!verified) {
    return ctx.text('Invalid signature', 400)
  }

  await next()
})
