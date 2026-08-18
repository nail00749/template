# Architecture

## FSD Structure

```
src/
├── app/        — providers, global config
├── routes/     — route definitions (thin, no business logic)
├── features/   — domain features (api, ui, model)
├── widgets/    — compositions of features
├── shared/     — ui, form, dialog, lib, hooks, api, icons
```

## Layer Rules

- `shared` cannot import from `features` or `widgets`
- `features` can import from `shared` only
- `widgets` can import from `features` and `shared`
- `routes` compose `widgets` and `features`; no business logic in routes
- Business logic belongs in `features`, not in routes or widgets

## Feature Structure

```
src/features/<domain>/
├── api/
│   ├── endpoints/     — Orval generated (do not edit)
│   ├── model.ts       — re-exports from generated
│   ├── <domain>.keys.ts   — query key factory
│   └── <entity>.queries.ts — queryOptions / mutationOptions
└── ui/
    └── <sub-feature>/
        ├── SomePage.tsx
        └── SomeDialog.tsx
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
