import { type Context } from 'hono'
import { ClerkClient, createClerkClient } from '@clerk/backend'
import * as WA from '../wa'
import * as calendarTools from '../tools/calendar'

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
    content: `
You are a general purpose AI assistant named Skedd. Assist the user with whatever they want.
You are provided with tool signatures to help the user list, reschedule, update or delete their calendar events.
You may call one or more of the defined tools to assist with the user query. They're already fitted with the necessary authorization codes.
Don't make assumptions about what tools are available. Only use the ones that have been specified.
Choose the appropriate tool according to the user's question. If you don't need to call it, please reply directly to the user's question.
When calling a tool, provide the necessary arguments to precisely fulfill the user's request.
When you have enough information from the tool results, respond directly to the user with a text message without having to call the tool again.
It is currently ${(new Date()).toString()}.
`.trim(),
  })

  let result = <GenResponseObj>(await ctx.env.AI.run(
    '@hf/nousresearch/hermes-2-pro-mistral-7b',
    {
      messages: prompt,
      tools: Object.values(calendarTools.toolDefinitions)
    }
  ))

  result.response && conversation.context.push({
    role: 'assistant',
    content: result.response
  })

  const finalText = []
  finalText.push(result.response)

  while (result.tool_calls !== undefined) {
    for (const toolcall of result.tool_calls) {
      if (toolcall.name.startsWith(calendarTools.toolNamePrefix)) {
        const clerkClient = createClerkClient({
          secretKey: ctx.env.CLERK_SECRET_KEY,
          publishableKey: ctx.env.CLERK_PUBLISHABLE_KEY,
        })
        const res = await callCalendarTool({
          clerkClient,
          userId: user.userId,
          // @ts-ignore
          toolName: toolcall.name,
          // @ts-ignore
          toolArgs: toolcall.arguments
        })

        const toolResult = {
          role: 'tool',
          name: toolcall.name,
          content: res?.content[0].text || ''
        }
        conversation.context.push(toolResult)
        prompt.push(toolResult)

        result = <GenResponseObj>(await ctx.env.AI.run(
          '@hf/nousresearch/hermes-2-pro-mistral-7b',
          {
            messages: prompt,
            tools: Object.values(calendarTools.toolDefinitions)
          }
        ))
        if (result.response) {
          conversation.context.push({ role: 'assistant', content: result.response })
          prompt.push({ role: 'assistant', content: result.response })
          finalText.push(result.response)
        }
        continue
      }
      // unknown tool
    }
  }

  ctx.env.KV_SKEDD_CHATS.put(convoKey, JSON.stringify(conversation))
  await WA.messages.sendText(
    ctx.env,
    number,
    finalText.join('\n\n')
  )

  return ctx.text('ok')
}

type GenResponseObj<T extends AiTextGenerationOutput = AiTextGenerationOutput> =
  T extends { response?: string } ? T : never

type CallCalendarToolArgs<T extends calendarTools.ToolName> = {
  clerkClient: ClerkClient
  userId: string
  toolName: T
  toolArgs: calendarTools.ToolArguments<T>
}

async function callCalendarTool<T extends calendarTools.ToolName>({
  clerkClient,
  userId,
  toolName,
  toolArgs
}: CallCalendarToolArgs<T>) {
  let token
  try {
    const clerkResponse = await clerkClient.users.getUserOauthAccessToken(userId, 'google')
    token = clerkResponse.data[0].token
  }
  catch (e) {
    // throw specific?
  }

  if (!token) {
    // problem
    return null
  }
  try {
    return await calendarTools.callTool(token, toolName, toolArgs)
  }
  catch (e) {
    return null
  }
}
