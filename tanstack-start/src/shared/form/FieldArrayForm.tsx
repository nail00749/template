import type { Key, ReactNode } from 'react'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@/shared/ui/field'
import { useFieldContext } from './form-context'

export interface FieldArrayItemRenderProps<TItem> {
  item: TItem
  index: number
}

export interface FieldArrayFormProps<TItem> {
  label: string
  createItem: () => TItem
  getItemKey: (item: TItem) => Key
  children: (props: FieldArrayItemRenderProps<TItem>) => ReactNode
  description?: string
  addLabel?: string
  emptyContent?: ReactNode
  itemLabel?: string
  minItems?: number
  maxItems?: number
  disabled?: boolean
  allowReorder?: boolean
}

export function FieldArrayForm<TItem>({
  label,
  createItem,
  getItemKey,
  children,
  description,
  addLabel = 'Добавить',
  emptyContent = 'Элементы не добавлены',
  itemLabel = 'Элемент',
  minItems = 0,
  maxItems,
  disabled = false,
  allowReorder = true,
}: FieldArrayFormProps<TItem>) {
  const field = useFieldContext<TItem[]>()
  const items = field.state.value ?? []
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const canAdd = !disabled && (maxItems === undefined || items.length < maxItems)

  return (
    <FieldSet
      data-invalid={isInvalid}
      disabled={disabled}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <FieldLegend variant="label">{label}</FieldLegend>
          {description && <FieldDescription>{description}</FieldDescription>}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canAdd}
          onClick={() => field.pushValue(createItem())}
        >
          <PlusIcon />
          {addLabel}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
          {emptyContent}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <section
              key={getItemKey(item)}
              className="rounded-md border p-3"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">{children({ item, index })}</div>

                <div className="flex shrink-0 items-center gap-1">
                  {allowReorder && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={disabled || index === 0}
                        aria-label={`Переместить ${itemLabel.toLowerCase()} ${index + 1} вверх`}
                        onClick={() => field.moveValue(index, index - 1)}
                      >
                        <ArrowUpIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={disabled || index === items.length - 1}
                        aria-label={`Переместить ${itemLabel.toLowerCase()} ${index + 1} вниз`}
                        onClick={() => field.moveValue(index, index + 1)}
                      >
                        <ArrowDownIcon />
                      </Button>
                    </>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={disabled || items.length <= minItems}
                    aria-label={`Удалить ${itemLabel.toLowerCase()} ${index + 1}`}
                    onClick={() => field.removeValue(index)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </FieldSet>
  )
}
