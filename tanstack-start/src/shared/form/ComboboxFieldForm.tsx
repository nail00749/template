import type { FC, ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from '@/shared/form/index'

interface Props {
  label?: string
  description?: string
  children: (props: { onBlur: () => void; 'aria-invalid': boolean }) => ReactNode
}

export const ComboboxFieldForm: FC<Props> = ({ label, description, children }) => {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      {children({
        onBlur: field.handleBlur,
        'aria-invalid': isInvalid,
      })}

      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
