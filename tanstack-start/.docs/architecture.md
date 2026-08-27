# Architecture

## FSD Structure

```
src/
├── app/        — providers, integrations (QueryClient, Devtools), global config
├── routes/     — file-based routes (thin, no business logic)
├── features/   — domain features (api, ui, model, hooks)
├── widgets/    — page-level compositions (layouts, error boundaries)
├── shared/     — ui, form, dialog, lib, hooks, api, icons
```

## Layer Rules

- `shared` — самостоятельный слой, не импортирует ничего из других слоёв.
- `features` — может импортировать из `shared` и между собой (один домен — один feature).
- `widgets` — может импортировать из `features` и `shared`; не содержит бизнес-логику.
- `routes` — тонкие файлы роутов; импортируют `features`/`widgets` напрямую.
- `app` — провайдеры (`root-provider.tsx`, Devtools), глобальные контексты.

## app/ layer

`src/app/` содержит:

- `providers/index.tsx` — обёртка всех провайдеров (DialogProvider, TooltipProvider и т.д.).
- `integrations/tanstack-query/root-provider.tsx` — создание `QueryClient` с глобальными `defaultOptions` (retry, error handling, toast).

## features/ layer

Каждый домен — отдельная папка в `features/`:

```
src/features/<domain>/
├── api/
│   ├── endpoints/     — Orval generated (do not edit)
│   ├── model.ts       — re-exports from generated
│   ├── <domain>.keys.ts   — query key factory
│   └── <entity>.queries.ts — queryOptions / mutationOptions
├── hooks/             — domain-specific hooks (useLogout, useEntityForm)
├── model/             — search schemas, mappers, types
└── ui/
    └── <sub-feature>/
        ├── SomePage.tsx
        └── SomeDialog.tsx
```

- **api/** — взаимодействие с бэкендом: query keys, queries, mutations.
- **hooks/** — хуки, специфичные для домена (не универсальные из `shared/hooks`).
- **model/** — search-схемы, мапперы, типы, константы (не UI).
- **ui/** — компоненты и страницы.

## Page Components and Logic

- A page component is the feature's UI entry point and may call its
  `use<Feature>` hook directly.
- Do not create a proxy page component that only calls a hook and forwards its
  result to a `<PageName>View` component:

  ```tsx
  // Wrong: the extra component and View layer add no value
  export function IdentityMappingsPage() {
    const page = useIdentityMappingsPage()

    return <IdentityMappingsPageView {...page} />
  }
  ```

- Do not create a `<PageName>View` component by default. Keep the page JSX in
  `<PageName>` unless the view is genuinely reusable or the page is large
  enough that splitting it improves readability.
- Separate non-presentational page logic into a co-located
  `use<Feature>` hook when the page contains queries, mutations, form setup,
  navigation, event handlers, or substantial derived state.
- Simple local UI state and trivial event handlers may stay in the component;
  a hook is not required for every component.

Typical structure:

```
features/posts/ui/create-post/
├── CreatePostPage.tsx   — calls useCreatePost and renders the page
└── useCreatePost.ts     — queries, mutations, form and page behavior
```

## Model Files

`features/<domain>/model/` contains search schemas and API param mappers — not components, not hooks:

```
features/legal/model/
├── checked-contracts-search.ts   — schema + mapper for route search params
├── suggestions-search.ts
└── legal-metrics-search.ts
```

Put a file here when:

- A route search schema needs a mapper function (`map*SearchToParams`)
- The schema is shared between a route and a feature component

## Presentation Files

Display-only logic (label maps, badge variant selectors) lives in `*Presentation.ts` co-located with the component:

```
features/legal/ui/checklist-versions/
├── ChecklistVersionsPage.tsx
├── checklistVersionPresentation.ts   ← labels, badge variants
└── checklistItemPresentation.ts
```

## Route Thinness

Routes only:

- call `useSearch` / `useParams`
- render a feature page component
- define `loader` / `validateSearch`

Never put hooks, mutations, or UI logic directly in route files.
