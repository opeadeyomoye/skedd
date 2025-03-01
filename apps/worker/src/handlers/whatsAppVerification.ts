import { Context } from 'hono'
import { eq, isNull } from 'drizzle-orm'
import { whatsAppUsers, whatsAppVerifications } from '../schema'
import { messages } from '../wa'

export async function get(ctx: Context<AppEnv>, id: string ) {
  // find non-expired match for the code
  const rex = await ctx.get('db').query.whatsAppVerifications.findFirst({
    where: (table, { and, eq, gt }) => and(
      eq(table.id, id),
      gt(table.codeExpiresAt, Date.now()),
      isNull(table.completedAt),
    ),
    orderBy: (table, { desc }) => desc(table.createdAt)
  })

  if (!rex?.id) {
    return ctx.json({ error: 'not found' }, 404)
  }

  return ctx.json({
    id: rex.id,
    phoneMask: rex.phoneNumber.slice(-4),
    createdAt: rex.createdAt,
  })
}


export async function verify(ctx: Context<AppEnv>, id: string, code: string) {
  const db = ctx.get('db')
  const rex = await ctx.get('db').query.whatsAppVerifications.findFirst({
    where: (table, { and, eq, gt }) => and(
      eq(table.id, ctx.req.param().id),
      gt(table.codeExpiresAt, Date.now()),
      isNull(table.completedAt)
    ),
    orderBy: (table, { desc }) => desc(table.createdAt)
  })
  if (rex?.code !== code) {
    return ctx.json({ error: 'invalid or expired code' }, 400)
  }

  db.update(whatsAppVerifications)
    .set({ completedAt: new Date() })
    .where(eq(whatsAppVerifications.id, rex.id))
    .execute()

  db.insert(whatsAppUsers).values({
    phoneNumber: rex.phoneNumber,
    userId: ctx.get('clerkAuth')?.userId as string,
    verificationId: rex.id,
  })
    .execute()
    .catch(() => null /** tell obs. */)

  await messages.sendText(
    ctx.env,
    rex.phoneNumber,
    welcomeText
  ).catch(() => null)

  return ctx.json({})
}

const welcomeText = `
Great work! Your Google Calendar is now connected! You can text me any time to:

1. schedule events
2. see what you have on the docket for the day
3. reschedule events
4. change your RSVP on an event

What would you like to do today?
`
