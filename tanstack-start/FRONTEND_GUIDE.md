# Reference Styleguide: Frontend Architecture (FSD-ish)

Этот документ описывает архитектуру, структуру и правила разработки фронтенда проекта **proback-frontend-legal**. Стиль ориентирован на FSD и отражает текущий код.

---

## 1. Архитектурный Обзор

Используем **FSD‑подобную** структуру с разделением по слоям:

- `app` — вход в приложение и глобальные провайдеры.
- `routes` — маршруты TanStack Router (file-based routing).
- `features` — функциональные блоки фич.
- `widgets` — композиция из фич/общих компонентов для страниц.
- `shared` — переиспользуемые UI/утилиты/формы/иконки.
- `integrations` — интеграции библиотек (React Query, Devtools и т.д.).

Ключевой принцип — **изолировать ответственность** и **не тянуть зависимости вверх по слоям**.

---

## 2. Структура Проекта

```text
src/
├── app/                     # Глобальные провайдеры и настройки приложения
│   └── providers/
├── features/                # Фичи (feature-slices)
│   └── integration/
│       └── components/
├── integrations/            # Интеграции библиотек (React Query и т.д.)
│   └── tanstack-query/
├── routes/                  # TanStack Router file-based маршруты
│   ├── __root.tsx            # Root layout + провайдеры + shell
│   ├── index.tsx             # "/" маршрут
│   └── inspection.tsx        # "/inspection" маршрут
├── shared/                  # Переиспользуемые блоки
│   ├── dialog/               # Управление диалогами
│   ├── form/                 # Обертки над TanStack Form
│   ├── icons/                # Иконки
│   ├── lib/                  # Утилиты
│   └── ui/                   # UI-компоненты (shadcn/base-ui + Tailwind)
├── widgets/                 # Композиционные виджеты
├── env.ts                   # Валидированные env-переменные
├── router.tsx               # Создание TanStack Router
├── routeTree.gen.ts         # Сгенерированное дерево маршрутов
└── styles.css               # Глобальные стили
```

---

## 3. Правила Слоёв (FSD ориентир)

### 3.1. `app`

- Хранит глобальные провайдеры и настройку окружения.
- `Providers` собирает глобальные контексты (например, `DialogProvider`).

Пример: `src/app/providers/index.tsx`.

### 3.2. `routes`

- Маршруты описываются через `createFileRoute`.
- Root layout находится в `__root.tsx`.
- Внутри root подключаем провайдеры и глобальные компоненты (Toaster и т.п.).

Пример: `src/routes/__root.tsx`.

### 3.3. `features`

- Фичи — это функциональные блоки, которые имеют ясную цель и могут быть переиспользованы.
- Внутри — `components`, `model`, `api`, `lib` (по необходимости).

Пример: `src/features/integration/components/MainZone.tsx`.

### 3.4. `widgets`

- Виджет — композиция нескольких фич и общих UI-компонентов.
- Используется как крупный блок на странице.

Пример: `src/widgets/NotFound/NotFound.tsx`.

### 3.5. `shared`

- Базовый слой, не зависит от `features`, `widgets`, `routes`.
- Содержит UI, хуки, утилиты, формы и общие либы.

Пример: `src/shared/ui/button.tsx`, `src/shared/lib/utils.ts`.

### 3.6. `integrations`

- Изолирует интеграции библиотек и провайдеров.
- Пример — React Query провайдер и devtools.

Пример: `src/integrations/tanstack-query/root-provider.tsx`.

---

## 4. Роутинг (TanStack Router)

- Маршруты задаются файлово в `src/routes`.
- Создание роутера — в `src/router.tsx`.
- Контекст роутера содержит `queryClient` из React Query.

Пример:

```tsx
export const Route = createFileRoute('/inspection')({
  component: RouteComponent,
})
```

Глобальный layout (`__root.tsx`) отвечает за:

- `<HeadContent />` и мета‑теги
- подключение глобальных стилей
- обертки провайдеров
- обработку 404 (`notFoundComponent`)

---

## 5. Data Layer

### 5.1. React Query

- Инициализация QueryClient в `integrations/tanstack-query/root-provider.tsx`.
- Контекст передается в роутер.

### 5.2. SSR Query Integration

- Используется `setupRouterSsrQueryIntegration` (TanStack Router + Query).
- Подключено в `src/router.tsx`.

---

## 6. UI и Стили

- UI построен на **Tailwind CSS** и **shadcn/ui** (через локальные компоненты).
- Базовые UI‑компоненты находятся в `src/shared/ui`.
- Композиция стилей через `clsx` + `tailwind-merge` (`cn` хелпер).

Пример:

```tsx
import { cn } from '@/shared/lib/utils'
```

---

## 7. Диалоги

- Диалоги управляются через `DialogProvider` и `useDialog`.
- Рендер всех диалогов централизован в `DialogRenderer`.

Пример использования:

```tsx
const { open } = useDialog()
open(DialogExample, 'example', { test: 'test props variable' })
```

---

## 8. Формы

- Используется `@tanstack/react-form`.
- Обертки и контексты объявлены в `src/shared/form`.
- Доступен `useAppForm` и переиспользуемые `TextFieldForm`, `CheckboxForm` и т.п.

---

## 9. Конфигурация окружения

- Валидируется через `@t3-oss/env-core` и `zod`.
- `clientPrefix = VITE_`.

Пример: `src/env.ts`.

---

## 10. Скрипты

Команды проекта (из `package.json`):

```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run test      # Vitest
npm run lint      # ESLint
npm run format    # Prettier
npm run check     # Prettier + ESLint fix
```

---

## 11. Правила разработки

- **Не тянуть зависимости вверх:** `shared` не импортирует `features` и выше.
- **Не смешивать UI и data:** UI-компоненты — в `shared/ui`, бизнес‑логика — в `features`/`widgets`.
- **Маршруты тонкие:** роут-компоненты собирают фичи/виджеты и управляют состоянием страницы.
- **Повторяемость:** повторяемый код уходит в `shared`.
- **Предсказуемые импорты:** использовать alias `@/` (настроен в `tsconfig.json`).

---

## 12. Пример потока (inspection)

1. Роут `src/routes/inspection.tsx` управляет состоянием страницы.
2. Контейнеры/компоненты находятся в `src/features/integration/components`.
3. UI‑компоненты берутся из `src/shared/ui`.
4. Уведомления — через `sonner` (`shared/ui/sonner.tsx`).

---

## 13. Что добавлять при расширении

- Новую бизнес-фичу — в `src/features/<feature>`.
- Общий компонент — в `src/shared/ui`.
- Глобальную интеграцию — в `src/integrations`.
- Новый экран — через файл маршрута в `src/routes` и сборку из `widgets`/`features`.

---

## 14. TODO

- Добавить `entities/` и `processes/` слои,
- Разнести API-клиенты в `shared/api` или `features/*/api`.
