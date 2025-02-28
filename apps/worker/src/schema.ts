import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'


export const whatsAppUsers = sqliteTable('whatsapp_users', {
  id: integer().primaryKey({ autoIncrement: true }), // purely 'cause we happen to like a lil' orderliness
  phoneNumber: text({ length: 15 }).notNull().unique(),
  userId: text({ length: 256 }).notNull().unique(), // 'unique' here === 1 phoneNumber per user(Id)
  verificationId: text({ length: 24 }).notNull().references(() => whatsAppVerifications.id),
  createdAt: text({ length: 26 }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const whatsAppVerifications = sqliteTable('whatsapp_verifications', {
  id: text({ length: 24 }).primaryKey(),
  phoneNumber: text({ length: 15 }).notNull(),
  code: text({ length: 8 }).notNull(),
  createdAt: text({ length: 26 }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
  codeExpiresAt: integer({ mode: 'number' }).notNull(),
  completedAt: integer({ mode: 'timestamp' }),
})

/**
 * whatsAppUsers
 * =============
 *  - id
 *  - phoneNumber
 *  - userId
 *  - verificationId
 *  - createdAt
 *
 * whatsAppVerifications
 * =====================
 *  - id -- unique string
 *  - phoneNumber
 *  - code
 *  - createdAt
 *  - codeExpiresAt
 *  - completedAt -- [N]
 *
 * //
 */
