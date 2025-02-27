import { Context } from 'hono'

export async function get(ctx: Context<AppEnv>, id: string ) {
  // find non-expired match for the code
  const rex = await ctx.get('db').query.whatsAppVerifications.findFirst({
    where: (table, { and, eq, gt }) => and(
      eq(table.id, id),
      gt(table.codeExpiresAt, Date.now())
    ),
    orderBy: (table, { desc }) => desc(table.createdAt)
  })

  if (!rex?.id) {
    return ctx.json({ error: 'not found' }, 404)
  }

  return ctx.json({
    id: rex.id,
    phoneNumber: rex.phoneNumber,
    createdAt: rex.createdAt,
  })
}

