import type { ChangeEvent, FC } from 'react'
import type { TextareaProps } from '@/shared/ui/textarea'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from '@/shared/form/index'
import { Textarea } from '@/shared/ui/textarea'

interface Props extends Omit<TextareaProps, 'value' | 'onChange' | 'id' | 'name' | 'onBlur'> {
  label?: string
  description?: string
}

export const TextAreaForm: FC<Props> = ({ label, description, ...props }) => {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    field.handleChange(e.target.value)
  }

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={onChange}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />

      {description && <FieldDescription>{description}</FieldDescription>}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
