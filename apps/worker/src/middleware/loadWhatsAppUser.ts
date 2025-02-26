import { createMiddleware } from 'hono/factory'
import { messages, Payloads } from '../wa'
import { randomString } from '../util/string'

const linkNumberMsg = (id: string, code: string) => `
Try this link broski -> https://skedd.xyz/numbers/${id}/verify

Pop in *${code}* and you should be good to go.
`

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

  const messageList = json.entry[0].changes[0].value.messages
  if (!messageList?.length) {
    return ctx.text('ghosting non-message hooks for now ✌️')
  }

  const number = messageList[0].from
  const user = await db.query.whatsAppUsers.findFirst({
    where: (users, { eq }) => eq(users.phoneNumber, number)
  }).catch(() => undefined)

  if (!user) {
    const record = newVerification(number)
    db.insert(db._.fullSchema.whatsAppVerifications).values(record).execute()
    try {
      await messages.sendText(
        ctx.env,
        number,
        linkNumberMsg(record.id, record.code)
      )
    }
    catch(e) { console.log(e) }

    return ctx.text('unknown sender')
  }

  ctx.set('waUser', user)

  await next()
})


function newVerification(number: string) {
  return {
    id: randomString(16),
    code: randomString(6).toUpperCase(),
    phoneNumber: number,
    codeExpiresAt: Date.now() + (20 * 60_000),
  }
}
