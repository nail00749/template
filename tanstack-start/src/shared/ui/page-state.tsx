import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export interface PageStateProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  actions?: ReactNode
  tone?: 'default' | 'destructive'
  className?: string
}

export function PageState({
  icon: Icon,
  title,
  description,
  actions,
  tone = 'default',
  className,
}: PageStateProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={cn('flex min-h-svh items-center justify-center bg-muted/30 p-4', className)}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground',
              tone === 'destructive' && 'bg-destructive/10 text-destructive',
            )}
          >
            <Icon
              className="size-6"
              aria-hidden="true"
            />
          </div>
          <CardTitle
            id={titleId}
            className="mt-2"
          >
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        {actions && <CardContent>{actions}</CardContent>}
      </Card>
    </section>
  )
}
