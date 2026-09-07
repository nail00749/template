import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { InputProps } from '@/shared/ui/input'
import { Input } from '@/shared/ui/input'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useFieldContext } from './form-context'

export interface NumberFieldFormProps extends Omit<
  InputProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onFocus'
  | 'onBlur'
  | 'id'
  | 'name'
  | 'type'
  | 'inputMode'
> {
  label?: string
  description?: string
  mode?: 'integer' | 'decimal'
}

const INTEGER_PATTERN = /^-?\d*$/
const DECIMAL_PATTERN = /^-?\d*(?:[.,]\d*)?$/

function formatValue(value: number | null): string {
  return value === null ? '' : String(value)
}

function parseValue(rawValue: string): number | null {
  if (rawValue === '' || rawValue === '-' || rawValue === '.' || rawValue === '-.') {
    return null
  }

  const value = Number(rawValue.replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

export function NumberFieldForm({
  label,
  description,
  mode = 'decimal',
  ...props
}: NumberFieldFormProps) {
  const field = useFieldContext<number | null>()
  const [inputValue, setInputValue] = useState(() => formatValue(field.state.value))
  const isFocusedRef = useRef(false)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  useEffect(() => {
    if (!isFocusedRef.current) {
      setInputValue(formatValue(field.state.value))
    }
  }, [field.state.value])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value
    const pattern = mode === 'integer' ? INTEGER_PATTERN : DECIMAL_PATTERN

    if (!pattern.test(rawValue)) {
      return
    }

    setInputValue(rawValue)
    field.handleChange(parseValue(rawValue))
  }

  const handleFocus = () => {
    isFocusedRef.current = true
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    setInputValue(formatValue(field.state.value))
    field.handleBlur()
  }

  return (
    <Field data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}

      <Input
        {...props}
        id={field.name}
        name={field.name}
        type="text"
        inputMode={mode === 'integer' ? 'numeric' : 'decimal'}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={isInvalid}
      />

      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
