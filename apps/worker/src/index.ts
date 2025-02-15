import { Hono } from 'hono'
import { z } from 'zod'
import signatureVerification from './middleware/signatureVerification'
import zodValidation from './middleware/zodValidation'

type Bindings = {
  META_APP_VERIFY_TOKEN: string
  META_APP_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Hello World!')
})

const MetaVerificationSchema = z.object({
  'hub.verify_token': z.string().min(160).max(192),
  'hub.challenge': z.string(),
  'hub.mode': z.enum(['subscribe']),
})

app.get('/meta/hub', zodValidation('query', MetaVerificationSchema), (ctx) => {
  const v = ctx.req.valid('query')
  if (v['hub.verify_token'] === ctx.env.META_APP_VERIFY_TOKEN) {
    return ctx.text(v['hub.challenge'])
  }

  return ctx.text('Ko le werk', 400)
})

app.use(signatureVerification)
app.post('/meta/hub', async (ctx) => {
  console.log('req->', await ctx.req.raw.clone().json())
  return ctx.text('ok')
})

export default app
