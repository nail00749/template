import type { ChangeEvent, FC } from 'react'
import type { InputProps } from '@/shared/ui/input'
import { Input } from '@/shared/ui/input'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from '@/shared/form/index'

interface Props extends Omit<InputProps, 'value' | 'onChange' | 'id' | 'name' | 'onBlur'> {
  label?: string
  description?: string
  valueType?: 'string' | 'int' | 'float'
}

const INT_REGEX = /^-?\d*$/
const FLOAT_REGEX = /^-?\d*(\.\d*)?$/

export const TextFieldForm: FC<Props> = ({
  label,
  description,
  valueType = 'string',
  ...props
}) => {
  const field = useFieldContext<string | number>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value

    if (valueType === 'string') {
      field.handleChange(rawValue)
      return
    }

    const regex = valueType === 'int' ? INT_REGEX : FLOAT_REGEX
    if (!regex.test(rawValue)) {
      return
    }

    if (rawValue === '' || rawValue === '-' || rawValue === '.' || rawValue === '-.') {
      field.handleChange(rawValue)
      return
    }

    const parsedValue =
      valueType === 'int' ? Number.parseInt(rawValue, 10) : Number.parseFloat(rawValue)

    if (Number.isNaN(parsedValue)) {
      return
    }

    field.handleChange(parsedValue)
  }

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Input
        id={field.name}
        name={field.name}
        value={field.state.value ?? ''}
        onChange={onChange}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        inputMode={valueType === 'string' ? undefined : valueType === 'int' ? 'numeric' : 'decimal'}
        {...props}
      />

      {description && <FieldDescription>{description}</FieldDescription>}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
