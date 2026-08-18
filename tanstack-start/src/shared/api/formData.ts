export const buildFormData = <T extends object>(body: T): FormData => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(body as unknown as Record<string, unknown>)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value as (Blob | string)[]) {
        formData.append(key, item)
      }
    } else {
      formData.append(key, value as Blob | string)
    }
  }
  return formData
}
