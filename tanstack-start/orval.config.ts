import { defineConfig } from 'orval'
import type { InputOptions, OutputOptions } from '@orval/core'

// Схема загружается только с явно заданного URL и не хранится в репозитории.
// OPENAPI_URL задаётся в окружении (например https://mira.localhost/openapi.json).
const OPENAPI_SOURCE = process.env.OPENAPI_URL

if (!OPENAPI_SOURCE) {
  throw new Error('OPENAPI_URL is required to generate API clients')
}

const apiInput = (tags: string[]): InputOptions => ({
  target: OPENAPI_SOURCE,
  filters: {
    mode: 'include',
    tags, // берём только эндпоинты нужной группы — убирает дубли всего API
  },
})

const apiOutput = (group: string): OutputOptions => ({
  mode: 'tags-split',
  target: `./src/shared/api/${group}/endpoints/index.ts`,
  schemas: `./src/shared/api/${group}/model`,
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

const apiHooks = (group: string) => ({
  afterAllFilesWrite: [
    `bunx oxfmt --write --config=.oxfmtrc.orval.json --ignore-path=.oxfmt-orval-ignore src/shared/api/${group}/`,
    `bunx oxlint --fix src/shared/api/${group}/`,
  ],
})

const apiGroup = (name: string, tags: string[]) => ({
  input: apiInput(tags),
  output: apiOutput(name),
  hooks: apiHooks(name),
})

export default defineConfig({
  admin: apiGroup('admin', ['admin', 'templates']),
  auth: apiGroup('auth', ['auth']),
})
