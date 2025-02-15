import { Hono } from 'hono'
import { z } from 'zod'
import zodValidation from './middleware/zodValidation'

type Bindings = {
  META_APP_VERIFY_TOKEN: string
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

app.get('/meta/hub', zodValidation('param', MetaVerificationSchema), (ctx) => {
  const v = ctx.req.valid('form')
  if (v['hub.verify_token'] === ctx.env.META_APP_VERIFY_TOKEN) {
    return ctx.text(v['hub.challenge'])
  }

  return ctx.text('Not found', 404)
})

export default app
