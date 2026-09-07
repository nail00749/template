import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useFieldContext } from './form-context'

export interface SelectFieldOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectFieldFormProps {
  label?: string
  description?: string
  placeholder?: string
  options: ReadonlyArray<SelectFieldOption>
}

export function SelectFieldForm({
  label,
  description,
  placeholder,
  options,
}: SelectFieldFormProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const currentValue = field.state.value ?? ''
  const selectedOption = options.find((option) => option.value === currentValue)
  const displayLabel = selectedOption?.label ?? currentValue

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Select
        name={field.name}
        value={currentValue}
        onValueChange={(value) => {
          if (value !== null) {
            field.handleChange(value)
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            field.handleBlur()
          }
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
