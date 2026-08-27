import type { ChangeEvent } from 'react'
import type { InputProps } from '@/shared/ui/input'
import { Input } from '@/shared/ui/input'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from './form-context'

export interface TextFieldFormProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'id' | 'name' | 'onBlur'
> {
  label?: string
  description?: string
}

export function TextFieldForm({ label, description, ...props }: TextFieldFormProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.handleChange(event.target.value)
  }

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Input
        id={field.name}
        name={field.name}
        value={field.state.value ?? ''}
        onChange={handleChange}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />

      {description && <FieldDescription>{description}</FieldDescription>}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
