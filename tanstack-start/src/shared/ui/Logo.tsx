import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

interface LogoProps extends Omit<ComponentProps<'img'>, 'src'> {}

export function Logo({ className, alt = '', ...props }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt={alt}
      width={64}
      height={64}
      className={cn('size-11 shrink-0', className)}
      {...props}
    />
  )
}
