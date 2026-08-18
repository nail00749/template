import type { FC } from 'react'
import type { DatePickerProps } from '@/shared/ui/date-picker'
import { DatePicker } from '@/shared/ui/date-picker'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from '@/shared/form/index'

interface Props extends Omit<DatePickerProps, 'value' | 'onChange' | 'onBlur' | 'id' | 'name'> {
  label?: string
  description?: string
}

export const DatePickerForm: FC<Props> = ({ label, description, ...props }) => {
  const field = useFieldContext<Date | undefined>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <DatePicker
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(date) => field.handleChange(date)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />

      {description && <FieldDescription>{description}</FieldDescription>}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
