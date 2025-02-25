import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  assetsInclude: ['./.tmp/drizzle/*.sql'],
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc', environment: 'test' },
      },
    },
  }
})
