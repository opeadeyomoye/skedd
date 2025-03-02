
type WorkerBindings = {
  META_APP_VERIFY_TOKEN: string
  META_APP_SECRET: string
  META_APP_ACCESS_TOKEN: string
  WA_BUSINESS_PHONE_ID: string
  DB: D1Database
  KV_SKEDD_CHATS: KVNamespace
  AI: Ai
}

type AppDatabaseSchema = typeof import('./src/schema')
interface AppEnv {
  Bindings: WorkerBindings
  Variables: {
    db: import('drizzle-orm/d1').DrizzleD1Database<AppDatabaseSchema> & {
      $client: D1Database
    }
    waUser?: import('drizzle-orm').InferModelFromColumns<
      AppDatabaseSchema['whatsAppUsers']['_']['columns']
    >
  }
}

declare module 'cloudflare:test' {
  interface ProvidedEnv extends WorkerBindings {}
}
