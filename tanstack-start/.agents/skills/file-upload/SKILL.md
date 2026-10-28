---
name: file-upload
description: >
  Add file upload to the tanstack-start frontend: FileFieldForm in a form,
  file schema validation, multipart requests with buildFormData, server file
  validation error messages, image previews.
---

# File upload

Contracts (authoritative, read before writing code):

- [.docs/files.md](../../../.docs/files.md) — FileFieldForm, buildFormData, errors, preview
- [.docs/forms.md](../../../.docs/forms.md) — the form itself (use the `form` skill)
- [.docs/api.md](../../../.docs/api.md) — the upload mutation (use the `api-query` skill)
- Reference implementation: `src/features/upload-template`

## Steps

1. Field: `field.FileFieldForm` with `accept`, `allowedExtensions`,
   `allowedMimeTypes`; default value `null`.
2. Schema: shared `fileSchema` / `createFileSchema(locale)`, `.nullable()` plus a
   `.refine` for required; size limits in `.refine`, not MIME or extension.
3. Use `validators.onChange` so the field shows validation reactively.
4. Request: `buildFormData({...})` from `@/shared/api/formData` in the mutation.
5. Success: `toast.success(...)`.
6. File-specific server message: set `meta: { disableToast: true }` and show
   one toast via `getFileValidationErrorMessage` or `getMessageFromError`.

## Checklist

- [ ] No custom `<input type="file">`
- [ ] No `z.instanceof(File)` without `.nullable()`/`.optional()`
- [ ] Object URLs are revoked on change and unmount
- [ ] Non-image files show icon + name, not rendered content

## Verify

```bash
bun run check
bun run typecheck
bun run test
```
