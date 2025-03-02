import { clerkMiddleware } from '@hono/clerk-auth'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { Buffer } from 'node:buffer'
import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import loadWhatsAppUser from './middleware/loadWhatsAppUser'
import requireClerkAuth from './middleware/requireClerkAuth'
import signatureVerification from './middleware/signatureVerification'
import * as whatsAppVerificationHandlers from './handlers/whatsAppVerification'
import zodValidation from './middleware/zodValidation'
import * as dbSchema from './schema'
import * as WA from './wa'

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
  c.set('db', drizzle(c.env.DB, { schema: dbSchema }))
  await next()
})

app.use('/meta/hub', signatureVerification, loadWhatsAppUser)
app.post('/meta/hub', async (ctx) => {
  /**
   * create cache key if not exists
   * pipe message to LLM context and orchestrate tool calling
   */
  const json = await ctx.req.raw.clone().json<WA.Payloads.TextMessage>()

  const waMessage = json.entry[0].changes[0].value.messages[0]
  const number = waMessage.from
  const text = waMessage.text.body
  const user = await ctx.get('db').query.whatsAppUsers.findFirst({
    where: (users, { eq }) => eq(users.phoneNumber, number)
  })

  if (!text.trim() || !user?.userId) {
    return ctx.text('weird')
  }
  type StoredConversation = {
    context: RoleScopedChatInput[]
  }

  const convoKey = `users.${user?.userId}.chatContext`
  const conversation = await ctx.env.KV_SKEDD_CHATS.get<StoredConversation>(
    convoKey, 'json'
  ) ?? { context: [] }
  conversation.context.push({ role: 'user', content: text })

  const prompt: RoleScopedChatInput[] = []
  prompt.push(...conversation.context)
  prompt.unshift({
    role: 'system',
    content: 'You are a general purpose AI assistant named Skedd. Help the user with whatever they want.',
  })

  const call = <GenResponseObj>(await ctx.env.AI.run(
    '@hf/nousresearch/hermes-2-pro-mistral-7b',
    { messages: prompt }
  ))
  conversation.context.push({
    role: 'assistant',
    content: call.response || ''
  })
  ctx.env.KV_SKEDD_CHATS.put(convoKey, JSON.stringify(conversation))

  await WA.messages.sendText(
    ctx.env,
    number,
    call.response || ''
  )
  type GenResponseObj<T extends AiTextGenerationOutput = AiTextGenerationOutput> =
    T extends { response?: string } ? T : never

  return ctx.text('ok')
})

app.use(clerkMiddleware(), requireClerkAuth)
app.get(
  '/whatsapp-verifications/:id',
  zodValidation('param',
    z.object({
      id: z.string().length(16)
    })
  ),
  async (ctx) => whatsAppVerificationHandlers.get(
    ctx,
    ctx.req.valid('param').id
  )
)

app.post(
  '/whatsapp-verifications/:id',
  zodValidation('param',
    z.object({
      id: z.string().length(16)
    })
  ),
  zodValidation('json',
    z.object({
      code: z.string().min(6).max(8),
    })
  ),
  async (ctx) => whatsAppVerificationHandlers.verify(
    ctx,
    ctx.req.valid('param').id,
    ctx.req.valid('json').code,
  )
)

app.get(`/devices`, async (c) => {
  const user = await c.get('db').query.whatsAppUsers.findFirst({
    where: (users, { eq }) => eq(users.userId, <string>c.get('clerkAuth')?.userId)
  }).catch(() => undefined)

  if (!user) {
    return c.json({}, 404)
  }

  return c.json([{
    phoneMask: user.phoneNumber.slice(-4),
    connectedAt: user.createdAt
  }])
})

export default app
