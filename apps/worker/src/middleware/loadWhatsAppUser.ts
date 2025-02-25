import { createMiddleware } from 'hono/factory'
import { Payloads } from '../wa'

export default createMiddleware<AppEnv>(async (ctx, next) => {
  const db = ctx.get('db')

  /*
   * load from whatsAppUsers
   * not there? try starting a new whatsapp verification
   *  - creates a new whatsAppVerfication record
   *  - sends the code to the messaging user, along with a link to activate their number
   *  - activation page & endpoint can only be accessed by logged-in folks
   *
   *  - meanwhile, return a 200 so meta is happy
   */
  const json = await ctx.req.raw.clone().json<Payloads.TextMessage>()

  if (json.entry[0]?.changes[0]?.value?.messages[0]?.type !== 'text') {
    return ctx.text('unsupported message type')
  }

  const number = json.entry[0].changes[0].value.messages[0].from
  const user = await db.query.whatsAppUsers.findFirst({
    where: (users, { eq }) => eq(users.phoneNumber, number)
  }).catch(() => undefined)

  if (!user) {
    // send them a verification link

    return ctx.text('unknown sender')
  }

  ctx.set('waUser', user)

  await next()
})
