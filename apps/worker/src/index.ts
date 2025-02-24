import { Hono } from 'hono'
import { Buffer } from 'node:buffer'
import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import signatureVerification from './middleware/signatureVerification'
import zodValidation from './middleware/zodValidation'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

const app = new Hono<AppEnv>()

app.get('/', (c) => {
  return c.text('Hello World!')
})

const MetaVerificationSchema = z.object({
  'hub.verify_token': z.string().min(160).max(192),
  'hub.challenge': z.string().min(5).max(30),
  'hub.mode': z.enum(['subscribe']),
})

app.get('/meta/hub', zodValidation('query', MetaVerificationSchema), (ctx) => {
  const v = ctx.req.valid('query')

  try {
    if (
      timingSafeEqual(
        Buffer.from(v['hub.verify_token']),
        Buffer.from(ctx.env.META_APP_VERIFY_TOKEN)
      )
    ) {
      return ctx.text(v['hub.challenge'])
    }
  }
  catch {}

  return ctx.text('Ko le werk', 400)
})

app.use(async (c, next) => {
  c.set('db', drizzle(c.env.DB, { schema }))
  await next()
})
app.use('/meta/hub', signatureVerification)
app.post('/meta/hub', async (ctx) => {
  console.log('req->', await ctx.req.raw.clone().json())
  return ctx.text('ok')
})

export default app
