import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'

interface TruncatedCellProps {
  value: ReactNode
  /**
   * Override the text used for the tooltip.
   * Required when `value` is not a plain string (e.g. JSX, number).
   */
  tooltipText?: string
  className?: string
  /**
   * Element to render as. Default is a block-level `<span>` (valid in any
   * context, including inside `<button>`). Use `inline` for inline placement
   * within a text run.
   * @default 'block'
   */
  display?: 'block' | 'inline'
}

/**
 * Cell content wrapper that truncates overflowing text with ellipsis
 * and shows a Tooltip with the full text on hover.
 * The tooltip is disabled when the text fits within the cell.
 */
export function TruncatedCell({
  value,
  tooltipText,
  className,
  display = 'block',
}: TruncatedCellProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const text = tooltipText ?? (typeof value === 'string' ? value : '')

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const check = () => {
      setIsTruncated(el.scrollWidth > el.clientWidth)
    }

    check()

    const observer = new ResizeObserver(check)
    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [text])

  const setRef = (node: HTMLElement | null) => {
    ref.current = node
  }

  return (
    <Tooltip disabled={!isTruncated}>
      <TooltipTrigger
        ref={setRef}
        render={
          <span
            className={cn(
              display === 'block' ? 'block' : 'inline-block',
              'truncate align-bottom pointer-events-auto',
              className,
            )}
          >
            {value}
          </span>
        }
      />
      {isTruncated && text ? (
        <TooltipContent>
          <p className="break-words max-w-xs whitespace-pre-wrap">{text}</p>
        </TooltipContent>
      ) : null}
    </Tooltip>
  )
}
