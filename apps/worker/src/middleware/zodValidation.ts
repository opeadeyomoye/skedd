import { validator } from 'hono/validator'
import type { ValidationTargets } from 'hono'
import type { ZodSchema } from 'zod'

export default function <T>(target: keyof ValidationTargets, schema: ZodSchema<T>) {
  return validator(target, (val, ctx) => {
    const result = schema.safeParse(val)
    if (result.success) {
      return result.data
    }

    return ctx.json({ issues: result.error.issues }, 422)
  })
}
