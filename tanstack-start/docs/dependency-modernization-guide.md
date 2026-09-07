# Обновление зависимостей: точный переносимый runbook

Снимок обновления зависимостей: **2 сентября 2026 года**. Стек: Bun + TypeScript + React + TanStack.
Раздел о файловой структуре актуализирован после FSD-переноса 7 сентября;
таблицы версий и результаты аудита ниже относятся к исходному снимку.

> `package.json` хранит допустимый semver-диапазон, а `bun.lock` — точную установленную версию. Для полностью воспроизводимого результата переносите изменения `package.json` и обязательно коммитьте новый `bun.lock`.

## 1. Целевые версии

| Пакет / runtime                 | Было в `package.json`                                | Стало в `package.json` | Точно в `bun.lock` |
| ------------------------------- | ---------------------------------------------------- | ---------------------- | ------------------ |
| Bun                             | не был зафиксирован                                  | `bun@1.4.0`            | `1.4.0`            |
| `@tanstack/react-form`          | `^1.33.0`                                            | `^1.33.5`              | `1.33.5`           |
| `@tanstack/react-form-devtools` | `^0.2.29`                                            | `^0.2.34`              | `0.2.34`           |
| `@tanstack/react-table`         | `^8.21.3`                                            | `^9.2.4`               | `9.2.4`            |
| `nitro`                         | alias `nitro-nightly@3.0.1-20260630-211222-ad3a2d47` | `^3.0.260610-beta`     | `3.0.260610-beta`  |
| `typescript`                    | `^5.7.2`                                             | `^6.0.3`               | `6.0.3`            |
| `@types/bun`                    | `^1.3.14`                                            | `^1.4.0`               | `1.4.0`            |
| `@types/node`                   | `^22.20.0`                                           | `^24.1.0`              | `24.13.3`          |
| `jsdom`                         | `^29.1.1`                                            | `^30.0.1`              | `30.0.1`           |
| `oxfmt`                         | `^0.57.0`                                            | `^0.66.0`              | `0.66.0`           |
| Docker image `oven/bun`         | `oven/bun:1`                                         | `oven/bun:1.4.0`       | `1.4.0`            |
| Docker image `caddy`            | `caddy:2-alpine`                                     | `caddy:2.11.4-alpine`  | `2.11.4`           |

TypeScript 7 пока не ставить: находящийся в дереве Orval `typedoc@0.28.20` объявляет поддержку только TypeScript `5.0.x ... 6.0.x`. Сам `orval` объявлен как `^8.19.0`, текущий lock разрешил `8.27.0`.

### Сохранённые devtools

Devtools не удалялись. Точный установленный снимок:

| Пакет                             | Диапазон   | Точно в lock |
| --------------------------------- | ---------- | ------------ |
| `@tanstack/devtools-vite`         | `^0.8.1`   | `0.8.5`      |
| `@tanstack/react-devtools`        | `^0.10.8`  | `0.10.12`    |
| `@tanstack/react-form-devtools`   | `^0.2.34`  | `0.2.34`     |
| `@tanstack/react-query-devtools`  | `^5.101.2` | `5.102.8`    |
| `@tanstack/react-router-devtools` | `^1.167.0` | `1.167.1`    |

## 2. Снять baseline

До изменений сохранить результаты:

```bash
bun --version
bun install --frozen-lockfile
bun audit
bun run check
bun run typecheck
bun run test
bun run build
```

Если baseline уже красный, записать существующие ошибки отдельно — не смешивать их с регрессиями обновления.

## 3. Обновить `package.json`

Выставить следующие значения:

```json
{
  "dependencies": {
    "@tanstack/react-form": "^1.33.5",
    "@tanstack/react-form-devtools": "^0.2.34",
    "@tanstack/react-table": "^9.2.4",
    "nitro": "^3.0.260610-beta"
  },
  "devDependencies": {
    "@types/bun": "^1.4.0",
    "@types/node": "^24.1.0",
    "jsdom": "^30.0.1",
    "oxfmt": "^0.66.0",
    "typescript": "^6.0.3"
  },
  "packageManager": "bun@1.4.0"
}
```

Это только фрагмент: остальные зависимости и скрипты проекта сохранить.

## 4. Удалить только подтверждённо неиспользуемое

В этом проекте удалены:

```text
@codemirror/lang-yaml@^6.1.2
@fontsource-variable/roboto@^5.2.9
@uiw/react-codemirror@^4.25.10
dompurify@^3.4.11
react-dropzone@^15.0.0
web-vitals@^5.3.0
```

Для каждого пакета сначала проверить импорты, конфиги и скрипты:

```bash
rg "имя-пакета|имя-экспорта" . \
  --glob '!node_modules/**' \
  --glob '!bun.lock'
```

Затем удалить найденный набор и пересобрать lock:

```bash
bun remove @codemirror/lang-yaml @fontsource-variable/roboto @uiw/react-codemirror dompurify react-dropzone web-vitals
bun install
bun pm ls
```

Не копировать список удалений вслепую: в другом проекте эти пакеты могут использоваться.

## 5. Мигрировать TanStack Table v8 → v9

Основные изменения API в `DataGrid`:

```tsx
import {
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

const dataGridFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnVisibilityFeature,
})

type DataGridFeatures = typeof dataGridFeatures
export type DataGridColumnDef<T extends RowData> = ColumnDef<DataGridFeatures, T>

const table = useTable({
  features: dataGridFeatures,
  columns,
  data: rows,
  rowCount: totalCount,
  manualPagination: true,
  manualSorting: true,
})
```

Также:

- `useReactTable` → `useTable`;
- удалить `getCoreRowModel()`;
- `table.getState().columnSizingInfo.deltaOffset` → `table.state.columnResizing.deltaOffset`;
- `ColumnDef<T>` → `ColumnDef<DataGridFeatures, T>`;
- module augmentation: `ColumnMeta<TData, TValue>` → `ColumnMeta<TFeatures, TData, TValue>`;
- добавить тесты controlled server-side sorting и pagination, чтобы v9 не начал сортировать/пагинировать строки локально.

## 6. Настроить TypeScript 6

В `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vite/client", "bun", "node"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`baseUrl` удалить: для этого alias он больше не нужен. После изменения обязательно выполнить `bun run typecheck`.

## 7. Удалить OpenAPI snapshot

Удалить `src/shared/api/openapi.json`, но сохранить сгенерированные API-клиенты в репозитории. Оставить один скрипт:

```json
{
  "scripts": {
    "generate-api": "bunx orval"
  }
}
```

В `orval.config.ts` требовать явный URL:

```ts
const OPENAPI_SOURCE = process.env.OPENAPI_URL

if (!OPENAPI_SOURCE) {
  throw new Error('OPENAPI_URL is required to generate API clients')
}
```

Генерация выполняется только так:

```bash
OPENAPI_URL=https://backend.example/openapi.json bun run generate-api
```

Если у CI нет авторизованного доступа к backend-схеме, API там не генерировать. Проверять уже закоммиченные клиенты через typecheck, tests и build.

Контроль fail-fast:

```bash
env -u OPENAPI_URL bun run generate-api
# ожидается exit 1 и: OPENAPI_URL is required to generate API clients
```

## 8. FSD-перенос файлов

Структура `src` приведена к слоям `app`, `pages`, `widgets`, `features`,
`entities`, `shared`. Каноническое дерево и правила импортов описаны в
`.docs/architecture.md`; оно является единственным архитектурным источником
истины.

Orval-файлы перемещены byte-identically в:

```text
src/shared/api/admin/{endpoints,model}
src/shared/api/auth/{endpoints,model}
```

Ручные фасады `src/shared/api/admin.ts` и `src/shared/api/auth.ts` отделяют
сгенерированные клиенты и типы от доменных query-обёрток. Перенос не меняет
значения query keys: фабрики `authKeys` и `templateKeys` сохраняют прежние
массивы ключей, поэтому существующий Query cache contract не меняется.

Генерация после одного лишь переноса не требуется: относительная глубина
импортов внутри сгенерированных деревьев сохранена. Для будущей генерации
по-прежнему необходим явный `OPENAPI_URL`; запуск без него должен завершаться
ошибкой `OPENAPI_URL is required to generate API clients`.

## 9. Зафиксировать Docker

`docker/dev/Dockerfile`:

```dockerfile
FROM oven/bun:1.4.0

WORKDIR /app
COPY package.json bun.lock* ./
RUN bun ci --ignore-scripts
COPY . .
```

В Compose удалить устаревший верхнеуровневый `version`, зафиксировать `caddy:2.11.4-alpine` и добавить:

```yaml
environment:
  - SERVER_URL=${SERVER_URL:-http://localhost:3000}
  - VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8002}
```

Минимальный `.dockerignore`:

```gitignore
node_modules
.output
.git
.DS_Store
.env
.env.*.local
coverage
```

## 10. Добавить CI и Renovate

CI должен использовать Bun из `packageManager` и выполнять строго в таком порядке:

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version-file: package.json # в monorepo указать путь до package.json
- run: bun ci --ignore-scripts
- run: bun audit
- run: bun run check
- run: bun run typecheck
- run: bun run test
- run: bun run build
```

Для Renovate:

- включить `lockFileMaintenance` раз в неделю;
- группировать minor/patch для `@tanstack/*`;
- отдельно группировать minor/patch toolchain: Vite, Vitest, TypeScript, Orval, oxfmt, oxlint, jsdom, Testing Library и `@types/*`;
- каждый major выпускать отдельным PR.

## 11. Финальная проверка

```bash
bun --version
# ожидается 1.4.0

bun install --frozen-lockfile --ignore-scripts
bun audit
bun run check
bun run typecheck
bun run test
bun run build
docker compose -f docker/dev/docker-compose.yml config --quiet
```

Дополнительно проверить, что удалённые пакеты и OpenAPI snapshot отсутствуют:

```bash
test ! -f src/shared/api/openapi.json
rg "react-dropzone|web-vitals|@uiw/react-codemirror|@codemirror/lang-yaml|@fontsource-variable/roboto|dompurify" \
  package.json src || true
```

Эталонный результат этого проекта после обновления:

- `bun audit`: **0 vulnerabilities**, 757 пакетов проверено;
- Vitest: **5 файлов, 44 теста успешно**;
- format/lint, typecheck и build: exit code `0`;
- build оставляет только warning о frontend chunk около 797 kB — это отдельная задача по code splitting, не ошибка обновления.
