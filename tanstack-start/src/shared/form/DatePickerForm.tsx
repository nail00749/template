import type { DatePickerProps } from '@/shared/ui/date-picker'
import { DatePicker } from '@/shared/ui/date-picker'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from './form-context'

export interface DatePickerFormProps extends Omit<
  DatePickerProps,
  'value' | 'onChange' | 'onBlur' | 'id' | 'name'
> {
  label?: string
  description?: string
}

export function DatePickerForm({ label, description, ...props }: DatePickerFormProps) {
  const field = useFieldContext<Date | null>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <DatePicker
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(date) => field.handleChange(date ?? null)}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      />

      {description && <FieldDescription>{description}</FieldDescription>}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
