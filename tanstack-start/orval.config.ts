import { defineConfig } from 'orval'
import type { InputOptions, OutputOptions } from '@orval/core'

// Единый источник схемы. Локально — файл, в CI/по требованию — живой URL из .env.
// OPENAPI_URL задаётся в .env (например https://mira.localhost/openapi.json).
// Если не задан — падаем на закоммиченный локальный снапшот.
const OPENAPI_SOURCE = process.env.OPENAPI_URL ?? './src/shared/api/openapi.json'

const featureInput = (tags: string[]): InputOptions => ({
  target: OPENAPI_SOURCE,
  filters: {
    mode: 'include',
    tags, // берём только нужные фиче эндпоинты — убирает дубли всего API
  },
})

const featureOutput = (feature: string): OutputOptions => ({
  mode: 'tags-split',
  target: `./src/features/${feature}/api/endpoints/index.ts`,
  schemas: `./src/features/${feature}/api/model`,
  client: 'axios',
  clean: true, // подчищает устаревшие сген-файлы при удалении эндпоинтов
  override: {
    header: false, // без меняющегося на каждый ген заголовка → чистые диффы
    useDates: true,
    mutator: {
      path: './src/shared/api/client.ts',
      name: 'customInstance',
    },
    formData: {
      path: './src/shared/api/formData.ts',
      name: 'buildFormData',
    },
  },
  urlEncodeParameters: true,
  namingConvention: 'PascalCase',
})

const featureHooks = (feature: string) => ({
  afterAllFilesWrite: [
    `bunx oxfmt --write --ignore-path=.oxfmt-orval-ignore src/features/${feature}/api/`,
    `bunx oxlint --fix src/features/${feature}/api/`,
  ],
})

const feature = (name: string, tags: string[]) => ({
  input: featureInput(tags),
  output: featureOutput(name),
  hooks: featureHooks(name),
})

export default defineConfig({
  admin: feature('admin', ['admin', 'templates']),
  auth: feature('auth', ['auth']),
})
