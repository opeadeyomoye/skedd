import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  assetsInclude: ['./.tmp/drizzle/*.sql'],
  test: {
    deps: {
      optimizer: {
        ssr: {
          enabled: true,
          include: ['@clerk/backend'],
        }
      },
    },
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc', environment: 'test' },
      },
    },
  }
})
