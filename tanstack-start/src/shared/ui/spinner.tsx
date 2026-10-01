import { Loader2Icon } from 'lucide-react'
import { useIntlayer } from 'react-intlayer'
import { cn } from '@/shared/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  const content = useIntlayer('shared-ui-spinner')
  return (
    <Loader2Icon
      role="status"
      aria-label={content.loading.value}
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
