import * as React from 'react'
import { cn } from '@/shared/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = '2xl', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto w-full px-4', maxWidthClasses[maxWidth], className)}
      {...props}
    />
  ),
)
Container.displayName = 'Container'

export { Container }
