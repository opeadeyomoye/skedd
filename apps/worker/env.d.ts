
type WorkerBindings = {
  META_APP_VERIFY_TOKEN: string
  META_APP_SECRET: string
  DB: D1Database
}

interface AppEnv {
  Bindings: WorkerBindings,
  Variables: {
  }
}

declare module 'cloudflare:test' {
  interface ProvidedEnv extends WorkerBindings {}
}
