import { intlayer } from 'vite-intlayer'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [intlayer()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    server: { deps: { inline: [/intlayer/] } },
  },
})
