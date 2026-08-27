import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, XIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

export interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | undefined) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
  name?: string
  'aria-invalid'?: boolean
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = 'Выберите дату',
  className,
  id,
  name,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected = value && !isNaN(value.getTime()) ? value : undefined

  return (
    <div className="relative w-full">
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              id={id}
              name={name}
              onBlur={onBlur}
              aria-invalid={ariaInvalid}
              className={cn(
                'w-full justify-start text-left font-normal',
                selected && 'pr-8',
                !selected && 'text-muted-foreground',
                className,
              )}
            >
              <CalendarIcon className="size-4" />
              {selected ? format(selected, 'dd.MM.yyyy') : placeholder}
            </Button>
          }
        />
        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange?.(date)
              setOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {selected && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
          aria-label="Очистить дату"
          onClick={() => onChange?.(undefined)}
        >
          <XIcon className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
