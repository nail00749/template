import { useId } from 'react'
import { useFieldContext } from '@/shared/form/index'
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

type Item<T> = {
  title: string
  description?: string
  value: T
}

type Props<T> = {
  items: Array<Item<T>>
}

export const RadioGroupForm = <T,>({ items }: Props<T>) => {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const id = useId()

  return (
    <FieldSet>
      <FieldLegend></FieldLegend>

      <FieldDescription></FieldDescription>

      <RadioGroup
        name={field.name}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        {items.map((item, i) => {
          return (
            <FieldLabel
              key={i}
              htmlFor={`${id}-${i}`}
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
                  id={`${id}-${i}`}
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
