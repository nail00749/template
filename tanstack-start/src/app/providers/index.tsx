import type { PropsWithChildren } from 'react'
import { DialogProvider } from '@/shared/dialog'
import { TooltipProvider } from '@/shared/ui/tooltip'

export function Providers({ children }: PropsWithChildren) {
  return (
    <TooltipProvider delay={150}>
      <DialogProvider>
        <div className="w-full">{children}</div>
      </DialogProvider>
    </TooltipProvider>
  )
}
