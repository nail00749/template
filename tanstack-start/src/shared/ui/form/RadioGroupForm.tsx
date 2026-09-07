import { useId } from 'react'
import type { FocusEvent } from 'react'
import { useFieldContext } from './form-context'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/shared/ui/field'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'

export interface RadioGroupFormItem {
  title: string
  description?: string
  value: string
  disabled?: boolean
}

export interface RadioGroupFormProps {
  label: string
  description?: string
  items: ReadonlyArray<RadioGroupFormItem>
  disabled?: boolean
}

export function RadioGroupForm({ label, description, items, disabled }: RadioGroupFormProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const id = useId()

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      field.handleBlur()
    }
  }

  return (
    <FieldSet data-invalid={isInvalid}>
      <FieldLegend variant="label">{label}</FieldLegend>

      {description && <FieldDescription>{description}</FieldDescription>}

      <RadioGroup
        name={field.name}
        value={field.state.value ?? ''}
        onValueChange={field.handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        aria-invalid={isInvalid}
      >
        {items.map((item, index) => {
          const itemId = `${id}-${index}`

          return (
            <FieldLabel
              key={item.value}
              htmlFor={itemId}
            >
              <Field
                orientation="horizontal"
                data-invalid={isInvalid}
              >
                <FieldContent>
                  <FieldTitle>{item.title}</FieldTitle>

                  {item.description && <FieldDescription>{item.description}</FieldDescription>}
                </FieldContent>

                <RadioGroupItem
                  value={item.value}
                  id={itemId}
                  disabled={item.disabled}
                  aria-invalid={isInvalid}
                />
              </Field>
            </FieldLabel>
          )
        })}
      </RadioGroup>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </FieldSet>
  )
}
