import type { IntlayerConfig } from 'intlayer'

const config = {
  internationalization: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
  },
  routing: {
    mode: 'no-prefix',
    enableProxy: false,
    // The application owns APP_LOCALE so SSR and client state share one source.
    storage: false,
  },
  content: {
    contentDir: ['src'],
    codeDir: ['src'],
  },
  editor: { enabled: false },
} satisfies IntlayerConfig

export default config
