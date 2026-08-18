import type { FC } from 'react'
import type { CheckboxProps } from '@/shared/ui/checkbox'
import { Checkbox } from '@/shared/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from '@/shared/form/index'

interface Props extends Omit<
  CheckboxProps,
  'value' | 'onCheckedChange' | 'id' | 'name' | 'onBlur'
> {
  label?: string
}

export const CheckboxForm: FC<Props> = ({ label, ...props }) => {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const onChange = (checked: boolean) => {
    field.handleChange(checked)
  }

  return (
    <Field
      data-invalid={isInvalid}
      orientation="horizontal"
    >
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={onChange}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />

      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
