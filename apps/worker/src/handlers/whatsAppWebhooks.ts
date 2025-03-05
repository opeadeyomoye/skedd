import { type Context } from 'hono'
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
    content: `You are a general purpose AI assistant named Skedd. Help the user with whatever they want.`.trim(),
  })

  let result = <GenResponseObj>(await ctx.env.AI.run(
    '@hf/nousresearch/hermes-2-pro-mistral-7b',
    { messages: prompt }
  ))

  conversation.context.push({
    role: 'assistant',
    content: result.response || ''
  })

  let finalText = ''
  finalText += result.response || ''

  while (result.tool_calls !== undefined) {
    for (const toolcall of result.tool_calls) {
      //
    }
  }

  ctx.env.KV_SKEDD_CHATS.put(convoKey, JSON.stringify(conversation))
console.log('prompting with...', prompt)
  await WA.messages.sendText(
    ctx.env,
    number,
    result.response || ''
  )
  type GenResponseObj<T extends AiTextGenerationOutput = AiTextGenerationOutput> =
    T extends { response?: string } ? T : never

  return ctx.text('ok')

/**
 * calling any calendar related function requires getting the user's access token
 * tools/calendar(?)
 *
 */
}
