import type { PropsWithChildren } from 'react'
import { DialogProvider } from '@/shared/ui/dialog-provider'
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
