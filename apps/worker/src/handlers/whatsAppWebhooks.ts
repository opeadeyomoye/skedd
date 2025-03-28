import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { ClerkClient, createClerkClient } from '@clerk/backend'
import { type CoreMessage, generateText } from 'ai'
import { type Context } from 'hono'
import { getToolDefinitions } from '../tools/calendar'
import * as WA from '../wa'

export async function onMessage(ctx: Context<AppEnv>) {
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
    context: CoreMessage[]
  }

  const google = createGoogleGenerativeAI({
    apiKey: ctx.env.GOOGLE_GENERATIVE_AI_API_KEY
  })

  const convoKey = `users.${user?.userId}.chatContext`
  const conversation = await ctx.env.KV_SKEDD_CHATS.get<StoredConversation>(
    convoKey, 'json'
  ) ?? { context: [] }
  conversation.context.push({ role: 'user', content: text })

  const messages: CoreMessage[] = []
  messages.push(...conversation.context)

  const clerkClient = createClerkClient({
    secretKey: ctx.env.CLERK_SECRET_KEY,
    publishableKey: ctx.env.CLERK_PUBLISHABLE_KEY,
  })
  const accessToken = await getGoogleAccessToken(clerkClient, user.userId)
  const calendarTools = getToolDefinitions(accessToken || '')

  const result = await generateText({
    model: google('gemini-2.0-flash-001'),
    system: `
You are a general purpose AI assistant named Skedd. Assist the user with whatever they want.
You are provided with tool signatures to help the user list, reschedule, update or delete their calendar events.
It's currently ${(new Date()).toString()}.
`,
    maxSteps: 8,
    tools: calendarTools,
    messages,
  })

  conversation.context.push(...result.response.messages)
  ctx.env.KV_SKEDD_CHATS.put(convoKey, JSON.stringify(conversation))

  await WA.messages.sendText(
    ctx.env,
    number,
    result.text
  )

  return ctx.text('ok')
}


async function getGoogleAccessToken(client: ClerkClient, userId: string) {
  let token
  try {
    const clerkResponse = await client.users.getUserOauthAccessToken(userId, 'google')
    token = clerkResponse.data[0].token
  }
  catch (e) {
    // throw specific?
  }

  if (!token) {
    // problem
    return null
  }

  return token
}
