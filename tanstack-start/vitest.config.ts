import { intlayer } from 'vite-intlayer'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [intlayer()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    exclude: [...configDefaults.exclude, 'scripts/braces-security.test.ts'],
    environment: 'jsdom',
    server: { deps: { inline: [/intlayer/] } },
  },
})
