import type { FC, PropsWithChildren } from 'react'
import { DialogProvider } from '@/shared/dialog'
import { SidebarProvider } from '@/shared/ui/sidebar'
import { TooltipProvider } from '@/shared/ui/tooltip'

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TooltipProvider delay={150}>
      <SidebarProvider>
        <DialogProvider>
          <div className="w-full">{children}</div>
        </DialogProvider>
      </SidebarProvider>
    </TooltipProvider>
  )
}
