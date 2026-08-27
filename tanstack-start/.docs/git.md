# Git & Version Control

## Branch Naming

Формат: `feature/{TICKET-ID}/{short_description}`

- `feature/` — обязательный префикс для функциональных задач. Для багфиксов — `fix/`.
- `{TICKET-ID}` — ID задачи в трекере, КАПСОМ (например `HR-6706`, `LLMOPS-944`, `MLD-67`).
- `{short_description}` — краткое описание на английском в `snake_case` или `kebab-case`.

Для hotfix'ов без тикета в трекере допустимо `fix/{short_description}` без ID —
но коммиты всё равно должны соответствовать формату `[{TICKET-ID}] {description}`:
используй `[NO-TICKET]` как placeholder, если трекер-тикета нет.

Примеры:

```
feature/HR-6706/create_index
feature/LLMOPS-6852/create_service
feature/MLD-67/checklist-manage
fix/HR-6891/summary-cards-comparison
fix/summary-cards-comparison  # допустимо только если тикета нет вообще
```

## Commit Format

Строгий формат для связи кода с задачами: `[{TICKET-ID}] {description}`

- `[{TICKET-ID}]` — ID задачи в квадратных скобках, КАПСОМ (обязательно).
- `{description}` — краткое понятное описание изменений на английском. Обычно начинается с глагола (`add`, `fix`, `update`, `remove`) — главное суть.

Примеры:

```
[HR-6706] create index
[HR-6706] fix review issue
[HR-944] fix error handling in Update method
[LLMOPS-6052] fill updated and needReindex fields
```

Анти-паттерны:

- `fix bug` — нет ID задачи
- `LLMOPS-6706 update` — нет скобок
- `[HR-6706] фикс бага` — описание на русском
