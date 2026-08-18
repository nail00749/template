import type { FC } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useFieldContext } from '@/shared/form/index'

type Option = {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  label?: string
  description?: string
  placeholder?: string
  options: Option[]
}

export const SelectFieldForm: FC<Props> = ({ label, description, placeholder, options }) => {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const currentValue = field.state.value
  const selectedOption = options.find((option) => option.value === currentValue)
  const displayLabel = selectedOption?.label ?? currentValue

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Select
        name={field.name}
        value={currentValue}
        onValueChange={(value) => {
          if (value !== null) field.handleChange(value)
        }}
        onOpenChange={(open) => {
          if (!open) field.handleBlur()
        }}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
        >
          <SelectValue placeholder={placeholder}>{displayLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
