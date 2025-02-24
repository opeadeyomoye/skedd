
type WorkerBindings = {
  META_APP_VERIFY_TOKEN: string
  META_APP_SECRET: string
  DB: D1Database
}

interface AppEnv {
  Bindings: WorkerBindings,
  Variables: {
    db: import('drizzle-orm/d1').DrizzleD1Database<typeof import('./src/schema')> & {
      $client: D1Database;
    }
  }
}

declare module 'cloudflare:test' {
  interface ProvidedEnv extends WorkerBindings {}
}
