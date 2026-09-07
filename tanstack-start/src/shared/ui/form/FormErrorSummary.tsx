import { CircleAlertIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { useFormContext } from './form-context'

export interface FormErrorSummaryProps {
  title?: string
  className?: string
  getFieldLabel?: (fieldName: string) => string
}

interface SummaryError {
  fieldName: string
  label: string
  message: string
}

function getErrorMessage(error: unknown): string | null {
  if (typeof error === 'string') {
    return error
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return typeof error.message === 'string' ? error.message : null
  }

  return null
}

function getFieldErrors(meta: unknown): ReadonlyArray<unknown> {
  if (typeof meta === 'object' && meta !== null && 'errors' in meta && Array.isArray(meta.errors)) {
    return meta.errors
  }

  return []
}

function focusField(fieldName: string) {
  document.getElementById(fieldName)?.focus()
}

export function FormErrorSummary({
  title = 'Исправьте ошибки в форме',
  className,
  getFieldLabel = (fieldName) => fieldName,
}: FormErrorSummaryProps) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => ({
        submissionAttempts: state.submissionAttempts,
        fieldMeta: state.fieldMeta,
      })}
    >
      {({ submissionAttempts, fieldMeta }) => {
        if (submissionAttempts === 0) {
          return null
        }

        const errorsByKey = new Map<string, SummaryError>()

        for (const [fieldName, meta] of Object.entries(fieldMeta)) {
          if (!meta) {
            continue
          }

          for (const error of getFieldErrors(meta)) {
            const message = getErrorMessage(error)

            if (message) {
              errorsByKey.set(`${fieldName}-${message}`, {
                fieldName,
                label: getFieldLabel(fieldName),
                message,
              })
            }
          }
        }

        const errors = [...errorsByKey.values()]

        if (errors.length === 0) {
          return null
        }

        return (
          <section
            role="alert"
            aria-live="polite"
            className={cn(
              'border-destructive/40 bg-destructive/5 text-destructive rounded-md border p-3',
              className,
            )}
          >
            <div className="flex items-center gap-2 font-medium">
              <CircleAlertIcon className="size-4" />
              {title}
            </div>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {errors.map((error) => (
                <li key={`${error.fieldName}-${error.message}`}>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-destructive"
                    onClick={() => focusField(error.fieldName)}
                  >
                    {error.label}: {error.message}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )
      }}
    </form.Subscribe>
  )
}
