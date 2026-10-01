import * as React from 'react'
import { useIntlayer } from 'react-intlayer'

import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  const content = useIntlayer('shared-ui-pagination')
  return (
    <nav
      role="navigation"
      aria-label={props['aria-label'] ?? content.pagination.value}
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('gap-1 flex items-center', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="pagination-item"
      {...props}
    />
  )
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? 'page' : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  )
}

function PaginationPrevious({
  className,
  text: textProp,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const content = useIntlayer('shared-ui-pagination')
  const text = textProp ?? content.previous.value
  return (
    <PaginationLink
      aria-label={props['aria-label'] ?? content.previousPage.value}
      size="default"
      className={cn('pl-2!', className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />

      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text: textProp,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  const content = useIntlayer('shared-ui-pagination')
  const text = textProp ?? content.next.value
  return (
    <PaginationLink
      aria-label={props['aria-label'] ?? content.nextPage.value}
      size="default"
      className={cn('pr-2!', className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>

      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  const content = useIntlayer('shared-ui-pagination')
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4 flex items-center justify-center",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />

      <span className="sr-only">{content.morePages}</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
