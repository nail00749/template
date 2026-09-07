import { useEffect, useEffectEvent, useState } from 'react'
import { Button } from '@/shared/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxListSkeleton,
} from '@/shared/ui/combobox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { useDebouncedValue } from '@/shared/lib/hooks/use-debounced-value'
import { useFieldContext } from './form-context'

export interface AsyncComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface AsyncComboboxFieldFormProps {
  label: string
  options: ReadonlyArray<AsyncComboboxOption>
  onSearchValueChange: (searchValue: string) => void
  description?: string
  placeholder?: string
  emptyMessage?: string
  errorMessage?: string | null
  selectedOption?: AsyncComboboxOption | null
  disabled?: boolean
  isLoading?: boolean
  isFetching?: boolean
  hasNextPage?: boolean
  isLoadingMore?: boolean
  loadMoreLabel?: string
  debounceMs?: number
  onLoadMore?: () => void
}

export function AsyncComboboxFieldForm({
  label,
  options,
  onSearchValueChange,
  description,
  placeholder = 'Начните вводить для поиска',
  emptyMessage = 'Ничего не найдено',
  errorMessage,
  selectedOption: selectedOptionProp,
  disabled,
  isLoading = false,
  isFetching = false,
  hasNextPage = false,
  isLoadingMore = false,
  loadMoreLabel = 'Показать ещё',
  debounceMs = 250,
  onLoadMore,
}: AsyncComboboxFieldFormProps) {
  const field = useFieldContext<string>()
  const selectedOptionFromProps =
    selectedOptionProp?.value === field.state.value ? selectedOptionProp : null
  const selectedOption =
    options.find((option) => option.value === field.state.value) ?? selectedOptionFromProps
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(selectedOption?.label ?? '')
  const debouncedSearchValue = useDebouncedValue(searchValue, debounceMs)
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  const notifySearchValueChange = useEffectEvent(onSearchValueChange)

  useEffect(() => {
    if (open) {
      notifySearchValueChange(debouncedSearchValue)
    }
  }, [debouncedSearchValue, open])

  useEffect(() => {
    if (!open) {
      setSearchValue(selectedOption?.label ?? '')
    }
  }, [open, selectedOption?.label])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      setSearchValue('')
      return
    }

    field.handleBlur()
  }

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

      {description && <FieldDescription>{description}</FieldDescription>}

      <Combobox
        items={options}
        filteredItems={options}
        filter={null}
        value={selectedOption}
        inputValue={searchValue}
        disabled={disabled}
        isItemEqualToValue={(option, value) => option.value === value.value}
        onInputValueChange={setSearchValue}
        onValueChange={(option) => field.handleChange(option?.value ?? '')}
        onOpenChange={handleOpenChange}
      >
        <ComboboxInput
          id={field.name}
          name={field.name}
          className="w-full"
          placeholder={placeholder}
          disabled={disabled}
          showClear={field.state.value !== ''}
          aria-invalid={isInvalid}
        />

        <ComboboxContent>
          {isLoading ? (
            <>
              <ComboboxListSkeleton />
              <span
                role="status"
                className="sr-only"
              >
                Загрузка вариантов
              </span>
            </>
          ) : (
            <>
              {errorMessage ? (
                <div
                  role="alert"
                  className="text-destructive p-3 text-sm"
                >
                  {errorMessage}
                </div>
              ) : (
                <ComboboxList>
                  <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                  {options.map((option) => (
                    <ComboboxItem
                      key={option.value}
                      value={option}
                      disabled={option.disabled}
                    >
                      {option.label}
                      <ComboboxItemIndicator />
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              )}

              {hasNextPage && !errorMessage && onLoadMore && (
                <div className="border-t p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    loading={isLoadingMore}
                    onClick={onLoadMore}
                  >
                    {loadMoreLabel}
                  </Button>
                </div>
              )}
            </>
          )}
        </ComboboxContent>
      </Combobox>

      {isFetching && !isLoading && (
        <span
          role="status"
          className="sr-only"
        >
          Обновление результатов поиска
        </span>
      )}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  )
}
