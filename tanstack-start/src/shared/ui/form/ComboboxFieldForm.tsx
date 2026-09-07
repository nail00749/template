import type { ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from './form-context'

export interface ComboboxFieldRenderProps {
  id: string
  name: string
  value: string
  onValueChange: (value: string | null) => void
  onBlur: () => void
  'aria-invalid': boolean
}

export interface ComboboxFieldFormProps {
  label?: string
  description?: string
  children: (props: ComboboxFieldRenderProps) => ReactNode
}

export function ComboboxFieldForm({ label, description, children }: ComboboxFieldFormProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      {children({
        id: field.name,
        name: field.name,
        value: field.state.value ?? '',
        onValueChange: (value) => field.handleChange(value ?? ''),
        onBlur: field.handleBlur,
        'aria-invalid': isInvalid,
      })}

      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
